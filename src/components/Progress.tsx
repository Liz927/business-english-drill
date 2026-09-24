import type { AppData, Category } from '../types';
import { categories } from '../types';
import { becPacks, findPack } from '../data/bec';
import { exercises } from '../data/exercises';
export default function Progress({ data }: { data: AppData }) {
  const recent = data.attempts.slice(-20);
  const rate = recent.length ? Math.round(recent.filter(a => a.rating !== 'Easy').length / recent.length * 100) : null;
  const stats = categories.map(category => {
    const ids = exercises.filter(q => q.category === category).map(q => q.id);
    const attempts = data.attempts.filter(a => ids.includes(a.questionId));
    const last = attempts.slice(-10);
    return { category, total: attempts.length, confidence: last.length ? last.filter(a => a.rating === 'Easy').length / last.length : 0, weak: Object.values(data.reviews).filter(r => ids.includes(r.questionId) && r.rating !== 'Easy').length };
  });
  const strongest = stats.filter(s => s.total >= 3).sort((a,b) => b.confidence - a.confidence || b.total - a.total)[0];
  const needs = stats.filter(s => s.weak).sort((a,b) => b.weak - a.weak);
  const weekCounts = new Map<Category, number>();
  data.attempts.filter(a => new Date(a.at).getTime() >= Date.now() - 7 * 86400000 && a.rating !== 'Easy').forEach(a => { const c = exercises.find(q => q.id === a.questionId)?.category; if(c) weekCounts.set(c,(weekCounts.get(c) ?? 0)+1); });
  const weekTop = [...weekCounts].sort((a,b) => b[1]-a[1])[0];
  return <><p className="eyebrow">CONFIDENCE, OVER TIME</p><h1>Progress</h1><p className="intro">A record of practice. No streaks to protect.</p><section className="exposure-progress"><h2>Input & gradual practice</h2><p><strong>{(data.exposureHistory ?? []).length}</strong> learning visits recorded · <strong>{data.phrases.filter(p => p.learningState === 'Almost Mine').length}</strong> expressions Almost Mine</p><p className="fine-print">Visits record stages explored, not mastery or exam readiness. Reading-only visits count.</p>{(data.exposureHistory ?? []).slice(-7).reverse().map(h => <div className="exposure-history" key={h.id}><span>{h.date} · {findPack(h.packId)?.title ?? h.packId}</span><span>{h.stages.join(' → ')}</span></div>)}</section><h2 className="section-title">Business topic coverage</h2><p className="fine-print">Topics explored, not proficiency scores. Personal-source visits: {(data.readings ?? []).filter(r => r.lastRead).length} materials read.</p><div className="topic-coverage">{becPacks.map(pack => { const visits = (data.exposureHistory ?? []).filter(h => h.packId === pack.id); return <div key={pack.id}><span>{pack.topic}</span><span>{visits.length ? `${visits.length} visits` : 'Not yet explored'}</span></div>; })}</div><h2 className="section-title">Output practice history</h2><div className="metrics">{[[data.completedDates.length,'Sessions completed'],[data.attempts.length,'Questions answered'],[data.phrases.length,'Phrases saved'],[rate === null ? '—' : `${rate}%`,'Recent hesitation rate']].map(([value,label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <p className="fine-print">Sessions = completed daily drills. Answers include review attempts. Hesitation = Hesitated or Difficult among your last {recent.length || 20} answers.</p>
    <div className="progress-notes"><section><p className="small-label">Strongest category</p><h2>{strongest?.category ?? 'Still finding your rhythm'}</h2><p>{strongest ? 'Based on Easy ratings in your last 10 answers per category, with at least 3 attempts.' : 'Answer at least 3 questions in a category to see a useful signal.'}</p></section><section><p className="small-label">Categories needing review</p><h2>{needs.length ? needs.slice(0,2).map(s => s.category).join(' & ') : 'Nothing flagged yet'}</h2><p>{needs.length ? 'Based on your latest Hesitated and Difficult ratings.' : 'Your self-ratings will help you decide what to revisit.'}</p></section></div>
    {weekTop && <p className="weekly">This week, you hesitated most in <strong>{weekTop[0]}</strong>.</p>}
    <h2 className="section-title">Your skill modules <span>10 areas of practice</span></h2><div className="module-list">{stats.map((s,i) => <div className="module-row" key={s.category}><span className="module-number">{String(i+1).padStart(2,'0')}</span><span>{s.category}</span><span className="muted">{s.total ? `${s.total} answered` : 'Not yet practiced'}</span>{s.weak > 0 && <span className="tag">{s.weak} to revisit</span>}</div>)}</div>
  </>;
}
