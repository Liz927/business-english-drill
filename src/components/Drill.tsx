import { useEffect, useRef } from 'react';
import type { Exercise, Phrase, Rating, SavedPhrase, Session } from '../types';
import { typeLabels } from '../data/exercises';
import Icon from './Icon';
interface Props {
  question: Exercise; session: Session; mode: 'daily' | 'review'; rescue: boolean; phrases: SavedPhrase[];
  onChange: (patch: Partial<Session>) => void; onRate: (rating: Rating) => void; onSave: (phrase: Phrase) => void; onExit: () => void;
}
export default function Drill({ question: q, session, mode, rescue, phrases, onChange, onRate, onSave, onExit }: Props) {
  const answer = useRef<HTMLDivElement>(null); const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [q.id]);
  useEffect(() => { if (session.revealed) answer.current?.focus(); }, [session.revealed]);
  const isTone = q.type === 'tone';
  const ready = isTone ? session.choice !== null : session.response.trim().length > 0;
  return <div className="exercise-page">
    <div className="section-top"><button className="text-button" onClick={onExit}>← Save & exit</button><span className="muted">{mode === 'daily' ? 'Today’s Drill' : 'Review'} · {session.index + 1} of {session.ids.length}</span></div>
    <div className="steps" aria-label={`Question ${session.index + 1} of ${session.ids.length}`}>{session.ids.map((id, i) => <span key={id} className={i <= session.index ? 'filled' : ''}/>)}</div>
    <div className="exercise-meta"><span className="tag">{q.category}</span><span>{typeLabels[q.type]}</span></div>
    <h1 className="exercise-title" ref={heading} tabIndex={-1}>{q.scenario}</h1><p className="prompt">{q.prompt}</p>
    {isTone ? <fieldset className="options" disabled={session.revealed}><legend className="sr-only">Choose the most appropriate response</legend>{q.options!.map((option, i) => <label key={option.text} className={`option ${session.choice === i ? 'selected' : ''} ${session.revealed && i === q.preferredAnswer ? 'preferred' : ''}`}><input type="radio" name="tone" checked={session.choice === i} onChange={() => onChange({ choice: i })}/><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option.text}</span>{session.revealed && i === q.preferredAnswer && <Icon name="check"/>}</label>)}</fieldset>
      : <div className="response-field"><label htmlFor="response">Your response <span>Use your own words.</span></label><textarea id="response" value={session.response} disabled={session.revealed} onChange={e => onChange({ response: e.target.value })} rows={q.type === 'scenario' ? 6 : 4} placeholder="How would you say it at work?" maxLength={3000}/><div className="field-footer"><span>{q.type === 'micro' ? 'Keep it short. A few clear sentences are enough.' : 'There is more than one good way to say this.'}</span><span>{session.response.trim() ? session.response.trim().split(/\s+/).length : 0} words</span></div></div>}
    {rescue && <div className="hint-area"><button className="text-button hint-button" aria-expanded={session.hint} onClick={() => onChange({ hint: !session.hint })}>{session.hint ? 'Hide hint' : 'Need a hint?'}</button>{session.hint && <p className="hint" lang="zh-CN">{q.hintZh}</p>}</div>}
    {!session.revealed ? <button className="primary reveal" disabled={!ready} onClick={() => onChange({ revealed: true })}>{isTone ? 'Check choice' : 'Compare responses'}<Icon name="arrow"/></button>
      : <div className="answer" ref={answer} tabIndex={-1}>
        <p className="eyebrow">{isTone ? session.choice === q.preferredAnswer ? 'A WELL-JUDGED CHOICE' : 'A DIFFERENT TONE TO CONSIDER' : 'ONE STRONG WAY TO SAY IT'}</p><blockquote>{q.modelAnswer}</blockquote>
        <div className="alternative"><span className="small-label">A shorter alternative</span><p>{q.alternativeAnswer}</p></div>
        <h2>{q.type === 'rewrite' ? 'What changed' : 'Why it works'}</h2><p>{q.explanation}</p>
        {isTone && <div className="option-feedback">{q.options!.map((option, i) => <p key={i}><strong>{String.fromCharCode(65 + i)}{session.choice === i ? ' · Your choice' : ''}{q.preferredAnswer === i ? ' · Preferred' : ''}</strong>{option.explanation}</p>)}</div>}
        <div className="phrase-suggestions"><span className="small-label">A phrase to keep</span>{q.phrases.map(p => { const saved = phrases.some(s => s.phrase === p.phrase); return <div className="phrase-suggestion" key={p.phrase}><span>{p.phrase}</span><button className="secondary" disabled={saved} onClick={() => onSave(p)}><Icon name={saved ? 'check' : 'phrases'}/>{saved ? 'Saved' : 'Save phrase'}</button></div>; })}</div>
        <div className="rating"><h2>How did that feel?</h2><p>Your confidence sets the next review. Different wording is welcome.</p><div className="rating-buttons">{(['Easy','Hesitated','Difficult'] as Rating[]).map((rating, i) => <button key={rating} className="rating-button" onClick={() => onRate(rating)}><strong>{rating}</strong><span>{['In 7 days','In 3 days','Tomorrow'][i]}</span></button>)}</div></div>
      </div>}
  </div>;
}
