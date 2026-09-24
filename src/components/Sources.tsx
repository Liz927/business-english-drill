import { useRef, useState } from 'react';
import { becPacks, officialFormat, officialPreparation } from '../data/bec';
import type { PersonalReading, SavedPhrase } from '../types';
interface Props { readings: PersonalReading[]; onChange: (readings: PersonalReading[]) => void; onSave: (phrase: SavedPhrase) => void; onBack: () => void }
const blank = { title: '', topic: 'General business', source: '', text: '' };
export default function Sources({ readings, onChange, onSave, onBack }: Props) {
  const [draft, setDraft] = useState(blank);
  const [selected, setSelected] = useState<string | null>(null);
  const [expression, setExpression] = useState('');
  const [context, setContext] = useState('');
  const [fn, setFn] = useState('Summarize');
  const [message, setMessage] = useState('');
  const textArea = useRef<HTMLDivElement>(null);
  const current = readings.find(r => r.id === selected);
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.source.trim()) return;
    const item: PersonalReading = { ...draft, title: draft.title.trim(), source: draft.source.trim(), text: draft.text.trim(), id: crypto.randomUUID(), note: '', savedAt: new Date().toISOString() };
    onChange([...readings,item]); setSelected(item.id); setDraft(blank); setMessage('Reading saved on this device.');
  }
  function selectText() {
    const selection = window.getSelection();
    if (!selection?.anchorNode || !textArea.current?.contains(selection.anchorNode) || !selection.focusNode || !textArea.current.contains(selection.focusNode)) return;
    const selectedText = selection.toString().trim();
    if (selectedText) { setExpression(selectedText.slice(0,3000)); const paragraph = selection.anchorNode.parentElement?.closest('p'); setContext(paragraph?.textContent?.slice(0,1500) ?? ''); }
  }
  function saveExpression(e: React.FormEvent) {
    e.preventDefault(); if (!current || !expression.trim()) return;
    onSave({ id: crypto.randomUUID(), phrase: expression.trim(), category: fn.trim() || 'Personal', example: '', context: context.trim(), topic: current.topic, sourceId: current.id, sourceTitle: `${current.title} · ${current.source}`, note: '', savedAt: new Date().toISOString() });
    setExpression(''); setContext(''); setMessage('Expression sent to Phrase Bank. Choose its learning state there.');
  }
  return <div className="sources-page"><button className="text-button" onClick={onBack}>← Back to today</button><p className="eyebrow">AUTHENTIC MATERIALS · YOUR READING WORKSPACE</p><h1>BEC sources & my texts</h1><p className="intro">Use the original material as your input. Read for the business meaning, notice the language, then choose whether to attempt the questions.</p>
    <div className="official-sources"><article><span className="tag">Official Cambridge source</span><h2>Sample papers & preparation</h2><p>Access reading papers and keys, writing tasks and sample commentary, listening audio and transcripts, and speaking preparation through Cambridge’s resource page.</p><a className="secondary" href={officialPreparation} target="_blank" rel="noreferrer">Open official BEC materials ↗</a><p className="fine-print">Opens online outside this app. Those files are not included in offline storage.</p></article><article><span className="tag">Study companion</span><h2>Read before testing</h2><ol><li>Choose one text or transcript from your material.</li><li>Identify the business problem and the writer’s purpose.</li><li>Notice evidence, contrasting ideas and recommendations.</li><li>Save useful language with its context.</li><li>Attempt the original questions when you are ready.</li></ol><a href={officialFormat} target="_blank" rel="noreferrer">View official skill requirements ↗</a></article></div>
    <details className="bring-text" open={!readings.length}><summary>Add material to my reading workspace</summary><form onSubmit={add} className="source-form"><p>Keep a reference to a book or sample paper, or paste an excerpt from material you use for personal study. Pasted text stays in this browser. The app does not generate explanations or answer keys for imported material.</p><label>Reading title<input required maxLength={200} value={draft.title} onChange={e => setDraft({ ...draft,title:e.target.value })}/></label><label>Book / source / page reference<input required maxLength={400} placeholder="Book title, edition, unit or page; or official sample reference" value={draft.source} onChange={e => setDraft({ ...draft,source:e.target.value })}/></label><label>Business topic<select value={draft.topic} onChange={e => setDraft({ ...draft,topic:e.target.value })}><option>General business</option>{becPacks.map(p => <option key={p.id}>{p.topic}</option>)}</select></label><label>Original text (optional)<textarea rows={8} maxLength={30000} value={draft.text} onChange={e => setDraft({ ...draft,text:e.target.value })} placeholder="Paste an excerpt, or leave blank to keep a reading log alongside your source."/></label><button className="primary" type="submit">Save reading material</button></form></details>
    {message && <p className="banner" role="status">{message}</p>}
    {!!readings.length && <label className="reading-picker">My saved materials<select value={selected ?? ''} onChange={e => { setSelected(e.target.value); setExpression(''); setContext(''); setMessage(''); }}><option value="" disabled>Choose a reading</option>{readings.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>}
    {current && <section className="personal-reading"><span className="tag">Personal material · {current.topic}</span><h2>{current.title}</h2><p className="muted">Source: {current.source}</p><div ref={textArea} className="reading-text reading-body personal-reading-body" onMouseUp={selectText} onKeyUp={selectText}>{current.text ? current.text.split(/\n+/).filter(Boolean).map((p,i) => <p key={i}>{p}</p>) : <p>Read in your original book or source, then use this space to record observations and expressions.</p>}</div><label>My observations<textarea rows={4} maxLength={5000} value={current.note} onChange={e => onChange(readings.map(r => r.id === current.id ? { ...r,note:e.target.value } : r))} placeholder="What is the business issue? How does the writer develop the argument? Which expressions would transfer?"/></label><button className="secondary" onClick={() => { onChange(readings.map(r => r.id === current.id ? { ...r,lastRead:new Date().toISOString() } : r)); setMessage('Reading visit recorded. Input is enough for today.'); }}>Record this reading visit</button>{current.lastRead && <p className="fine-print">Last read: {new Date(current.lastRead).toLocaleDateString('en')}</p>}<form className="source-form exposure-card" onSubmit={saveExpression}><h3>Keep an expression from this source</h3><p className="muted">Select text above, or paste or type it here. Context travels with the expression.</p><label>Expression from this source<textarea required maxLength={3000} value={expression} onChange={e => setExpression(e.target.value)}/></label><label>Communication function<input maxLength={150} value={fn} onChange={e => setFn(e.target.value)}/></label><label>Original context<textarea maxLength={1500} value={context} onChange={e => setContext(e.target.value)}/></label><button className="primary" type="submit">Save to Phrase Bank</button></form></section>}
  </div>;
}
