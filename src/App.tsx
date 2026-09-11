import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { AppData, Phrase, Rating, Session } from './types';
import { exercises } from './data/exercises';
import { dailyQuestions, dueItems, localDate, nextReview } from './lib/schedule';
import { downloadData, emptyData, loadData, STORAGE_KEY } from './lib/storage';
import Icon from './components/Icon';
import Drill from './components/Drill';
import PhraseBank from './components/PhraseBank';
import Progress from './components/Progress';
import { useMobileKeyboard } from './hooks/useMobileKeyboard';

type Page = 'home' | 'review' | 'progress' | 'phrases' | 'settings' | 'drill' | 'done';
const navigation: { page: Page; label: string; icon: string }[] = [
  { page: 'home', label: 'Today', icon: 'home' }, { page: 'review', label: 'Review', icon: 'review' },
  { page: 'progress', label: 'Progress', icon: 'progress' }, { page: 'phrases', label: 'Phrase Bank', icon: 'phrases' }, { page: 'settings', label: 'Settings', icon: 'settings' }
];
const newSession = (ids: string[], date: string): Session => ({ ids, date, index: 0, response: '', choice: null, revealed: false, hint: false });

export default function App() {
  useMobileKeyboard();
  const [initial] = useState(loadData);
  const [data, setData] = useState<AppData>(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const blocked = useRef(!!initial.error);
  const [page, setPage] = useState<Page>('home');
  const [mode, setMode] = useState<'daily' | 'review'>('daily');
  const [today, setToday] = useState(localDate());
  const [offline, setOffline] = useState(!navigator.onLine);
  const [reset, setReset] = useState(false);
  const [notice, setNotice] = useState('');
  const [swError, setSwError] = useState(false);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({ onRegisterError: () => setSwError(true) });
  const main = useRef<HTMLElement>(null);
  const session = mode === 'daily' ? data.session : data.reviewSession;
  const question = session && exercises.find(q => q.id === session.ids[session.index]);
  const todayComplete = data.completedDates.includes(today);
  const due = dueItems(data.reviews, today).filter(r => exercises.some(q => q.id === r.questionId));
  const dailyActive = data.session?.date === today && data.session.index < data.session.ids.length;
  const reviewActive = data.reviewSession && data.reviewSession.index < data.reviewSession.ids.length;

  useEffect(() => {
    if (blocked.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageError(null); }
    catch { setStorageError('Your browser could not save this change. Keep this page open and export your data in Settings. Storage may be full or unavailable.'); }
  }, [data]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { const dark = data.theme === 'dark' || (data.theme === 'system' && media.matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#192a24' : '#f7f6f2'); };
    apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply);
  }, [data.theme]);
  useEffect(() => {
    const update = () => { setOffline(!navigator.onLine); setToday(localDate()); };
    addEventListener('online', update); addEventListener('offline', update); document.addEventListener('visibilitychange', update);
    const timer = setInterval(update, 30000);
    return () => { removeEventListener('online', update); removeEventListener('offline', update); document.removeEventListener('visibilitychange', update); clearInterval(timer); };
  }, []);
  useEffect(() => { window.scrollTo(0,0); main.current?.focus({ preventScroll: true }); }, [page]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 2800); return () => clearTimeout(timer); } }, [notice]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try { void Promise.resolve(context.registerTool({ name: 'get_drill_progress', description: 'Read local daily completion, due review count, and phrase count. Does not reveal written responses.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: (input: unknown) => { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object'); return { todayComplete, sessionsCompleted: data.completedDates.length, questionsAnswered: data.attempts.length, phrasesSaved: data.phrases.length, reviewsDue: due.length }; } }, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser capability. */ }
    return () => lifecycle.abort();
  }, [todayComplete, data.completedDates.length, data.attempts.length, data.phrases.length, due.length]);

  function startDaily() {
    if (todayComplete) { setMode('daily'); setPage('done'); return; }
    if (!dailyActive) setData(d => ({ ...d, session: newSession(dailyQuestions(exercises, d.attempts, today), today) }));
    setMode('daily'); setPage('drill');
  }
  function startReview() {
    if (!reviewActive && !due.length) return;
    if (!reviewActive) setData(d => ({ ...d, reviewSession: newSession(due.slice(0,5).map(r => r.questionId), today) }));
    setMode('review'); setPage('drill');
  }
  function changeSession(patch: Partial<Session>) {
    setData(d => { const key = mode === 'daily' ? 'session' : 'reviewSession'; return { ...d, [key]: d[key] ? { ...d[key], ...patch } : null }; });
  }
  function rate(rating: Rating) {
    if (!session || !question || !session.revealed) return;
    const finished = session.index + 1 === session.ids.length;
    const at = new Date();
    setData(d => {
      const key = mode === 'daily' ? 'session' : 'reviewSession'; const current = d[key];
      if (!current || current.index !== session.index || !current.revealed) return d;
      return { ...d,
        attempts: [...d.attempts, { questionId: question.id, rating, at: at.toISOString(), mode, response: current.response, choice: current.choice }],
        reviews: { ...d.reviews, [question.id]: { questionId: question.id, rating, due: nextReview(rating, at), lastReviewed: at.toISOString() } },
        completedDates: finished && mode === 'daily' ? [...new Set([...d.completedDates, current.date])] : d.completedDates,
        [key]: { ...current, index: current.index + 1, response: '', choice: null, revealed: false, hint: false }
      };
    });
    if (finished) setPage('done'); else window.scrollTo(0,0);
  }
  function savePhrase(phrase: Phrase) {
    setData(d => d.phrases.some(p => p.phrase === phrase.phrase) ? d : { ...d, phrases: [...d.phrases, { ...phrase, id: crypto.randomUUID(), note: '', savedAt: new Date().toISOString() }] });
    setNotice('Phrase saved to your bank.');
  }
  function exportBackup() {
    try { downloadData(blocked.current ? localStorage.getItem(STORAGE_KEY) ?? '{}' : JSON.stringify(data,null,2), `business-english-drill-${today}.json`); setNotice('Backup downloaded.'); }
    catch { setStorageError('Your browser is preventing access to stored data. Try allowing storage for this site.'); }
  }
  function resetData() {
    try { localStorage.removeItem(STORAGE_KEY); blocked.current = false; setStorageError(null); setData(emptyData()); setReset(false); setNotice('Local data cleared.'); }
    catch { setStorageError('Your browser did not allow the reset. No data was cleared.'); setReset(false); }
  }

  return <div className={`shell ${page === 'drill' ? 'in-drill' : ''}`}><a className="skip-link" href="#main">Skip to content</a><header className="header"><button className="brand" onClick={() => setPage('home')} aria-label="Business English Drill home"><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt=""/><span>Business English<span className="brand-sub">DRILL</span></span></button><span className="header-note">Small practice. Real conversations.</span></header>
    <nav className="navigation" aria-label="Main navigation">{navigation.map(item => <button key={item.page} aria-current={page === item.page || (item.page === 'home' && (page === 'drill' || page === 'done') && mode === 'daily') ? 'page' : undefined} onClick={() => setPage(item.page)}><Icon name={item.icon}/><span>{item.label}</span>{item.page === 'review' && due.length > 0 && <span className="nav-count">{due.length}</span>}</button>)}</nav>
    {storageError && <div className="banner error" role="alert">{storageError}<button className="text-button" onClick={() => setPage('settings')}>Open Settings</button></div>}
    {offline && <div className="banner" role="status">You’re offline. Your drills and saved phrases are available on this device.</div>}
    <main id="main" ref={main} tabIndex={-1}>
      {page === 'home' && <><div className="section-top home-date"><p className="eyebrow">YOUR DAILY MOMENT OF CLARITY</p><span>{new Date(`${today}T12:00:00`).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div><section className="daily"><div><p className="eyebrow">{todayComplete ? 'PRACTICE COMPLETE' : dailyActive ? 'PICK UP WHERE YOU LEFT OFF' : 'A LITTLE PRACTICE. A CLEARER VOICE.'}</p><h1>{todayComplete ? 'Good. Go to work.' : 'Today’s Drill'}</h1><p>{todayComplete ? 'You’ve made time for your words today.' : <>5 questions <span className="dot">·</span><Icon name="clock" size={16}/> 10–15 min</>}</p>{!todayComplete ? <button className="primary" onClick={startDaily}>{dailyActive ? `Continue · ${data.session!.index + 1} of 5` : 'Start'}<Icon name="arrow"/></button> : <p className="completion-line"><Icon name="check"/> Five questions. Enough for today.</p>}</div><div className="daily-art" aria-hidden="true"><span>“</span><i/><i/><i/></div></section>
        <p className="quiet">Practice the meaning. Find your phrasing. Bring it to work.</p>
        <div className="home-links">{[{ page: 'review' as const, title: 'Review', description: reviewActive ? 'Your review is ready to continue.' : due.length ? `${due.length} items ready to revisit.` : 'Let the language settle. Nothing due yet.', icon: 'review' },{ page: 'phrases' as const, title: 'Phrase Bank', description: data.phrases.length ? `${data.phrases.length} useful phrases, in your own collection.` : 'Keep the phrases you want to make your own.', icon: 'phrases' },{ page: 'progress' as const, title: 'Progress', description: 'Notice what’s becoming more natural.', icon: 'progress' },{ page: 'settings' as const, title: 'Settings', description: 'Make this little space work for you.', icon: 'settings' }].map(item => <button className="home-link" key={item.page} onClick={() => setPage(item.page)}><span className="link-icon"><Icon name={item.icon}/></span><span><strong>{item.title}</strong><span>{item.description}</span></span><Icon name="arrow" size={18}/></button>)}</div>
        <div className="home-bottom"><span>Built around your working day.</span><span>Meetings · Projects · Professional communication</span></div></>}
      {page === 'drill' && question && session && <Drill question={question} session={session} mode={mode} rescue={data.rescue} phrases={data.phrases} onChange={changeSession} onRate={rate} onSave={savePhrase} onExit={() => setPage(mode === 'daily' ? 'home' : 'review')}/>}
      {page === 'drill' && (!question || !session) && <div className="empty"><h1>This session is finished.</h1><button className="primary" onClick={() => setPage('home')}>Back to today</button></div>}
      {page === 'done' && <div className="done"><div className="done-mark"><Icon name="check" size={38}/></div><p className="eyebrow">{mode === 'daily' ? 'YOUR DAILY DRILL IS COMPLETE' : 'YOUR REVIEW IS COMPLETE'}</p><h1>Good. Go to work.</h1><p>A little more ready for the next conversation.<br/>{storageError ? 'Your changes are not saved. Export your data in Settings.' : 'Your progress is saved on this device.'}</p><button className="primary" onClick={() => setPage('home')}>Back to today<Icon name="arrow"/></button><p className="quiet">{mode === 'daily' ? 'A fresh set will be here tomorrow.' : 'Your next review dates reflect today’s ratings.'}</p></div>}
      {page === 'review' && <><p className="eyebrow">MAKE THE WORDS COME EASIER</p><h1>Review</h1><p className="intro">A short return to the phrases that took a little thought.</p><div className="review-summary"><div><span className="review-count">{due.length}</span><span>items due</span></div><p>Difficult items come first.<br/>Up to 5 questions in a review.</p>{(due.length > 0 || reviewActive) && <button className="primary" onClick={startReview}>{reviewActive ? 'Continue review' : 'Start review'}<Icon name="arrow"/></button>}</div>{due.length === 0 && !reviewActive && <div className="empty"><Icon name="review" size={32}/><h2>You’re all caught up.</h2><p>{Object.keys(data.reviews).length ? `Next review: ${Object.values(data.reviews).map(r => r.due).sort()[0]}. No extra practice needed today.` : 'Complete a drill and rate how each response felt. Your review list will take shape here.'}</p></div>}{due.length > 0 && <div className="review-list">{due.map(item => <div className="review-row" key={item.questionId}><span><strong>{exercises.find(q => q.id === item.questionId)!.category}</strong><span>{exercises.find(q => q.id === item.questionId)!.scenario}</span></span><div><span className="tag">{item.rating}</span><small>{item.due < today ? 'Overdue' : 'Due today'}</small></div></div>)}</div>}<p className="schedule-note">Easy → 7 days <span>Hesitated → 3 days</span> Difficult → tomorrow</p></>}
      {page === 'phrases' && <PhraseBank phrases={data.phrases} onChange={phrases => setData(d => ({ ...d, phrases }))}/>}
      {page === 'progress' && <Progress data={data}/>}
      {page === 'settings' && <><p className="eyebrow">YOUR PRACTICE, YOUR PREFERENCES</p><h1>Settings</h1><div className="settings-list"><section><div><h2>Appearance</h2><p>A comfortable space, any time of day.</p></div><label><span className="sr-only">Appearance</span><select value={data.theme} onChange={e => setData(d => ({ ...d, theme: e.target.value as AppData['theme'] }))}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></label></section><section><div><h2>Chinese rescue hints</h2><p>Show “Need a hint?” during exercises. Hints stay hidden until you ask.</p></div><button className={`toggle ${data.rescue ? 'on' : ''}`} role="switch" aria-checked={data.rescue} aria-label="Chinese rescue hints" onClick={() => setData(d => ({ ...d, rescue: !d.rescue }))}><span/></button></section><section><div><h2>On this device</h2><p>Your answers, phrases, and progress stay in this browser. Clearing site data removes them. Export a copy to keep a record.</p></div><button className="secondary" onClick={exportBackup}>Export data</button></section><section><div><h2>Install on iPhone</h2><p>Open the app’s HTTPS address in Safari, tap Share, then Add to Home Screen. Open it once online to prepare offline practice.</p><p className="fine-print">A computer’s localhost address works only on that computer. iPhone installation needs a reachable HTTPS host; the development server is for local testing.</p></div></section><section><div><h2>Offline availability</h2><p>{swError ? 'Offline setup failed. Reopen the app online and try again.' : import.meta.env.DEV ? 'Available in the production version of the app.' : offlineReady ? 'Ready for offline practice on this device.' : 'Offline preparation requires an initial online visit.'}</p></div></section>{needRefresh && <section><div><h2>An update is ready</h2><p>Your saved progress will be kept when the app reloads.</p></div><button className="secondary" onClick={() => { void updateServiceWorker(true); }}>Update app</button></section>}<section><div><h2>Reset local data</h2><p>Remove all answers, saved phrases, and preferences from this browser.</p></div><button className="text-button danger" onClick={() => setReset(true)}>Reset data</button></section></div><p className="fine-print">Business English Drill · 40 exercises · 10 skill modules<br/>Writing responses use model examples and self-reflection. Confidence ratings are not a language proficiency score.</p></>}
    </main><footer className="footer"><span>Clear. Calm. In your own words.</span><span>Business English Drill</span></footer>
    {notice && <div className="toast" role="status"><Icon name="check"/>{notice}</div>}
    {reset && <div className="modal-backdrop" onKeyDown={e => { if(e.key === 'Escape') setReset(false); }}><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><h2 id="reset-title">Clear your local practice?</h2><p id="reset-description">This removes all progress, answers, and saved phrases from this browser. Export a copy first if you want to keep a record.</p><div><button autoFocus className="secondary" onClick={() => setReset(false)} onKeyDown={e => { if(e.key === 'Tab' && e.shiftKey) { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLButtonElement).focus(); } }}>Keep my data</button><button className="primary destructive" onClick={resetData} onKeyDown={e => { if(e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLButtonElement).focus(); } }}>Clear data</button></div></div></div>}
  </div>;
}
