import type { LearningState } from '../types';
export default function LearningStates({ value, onChange }: { value?: LearningState; onChange: (state: LearningState) => void }) {
  return <fieldset className="learning-states"><legend>How does this expression feel?</legend>{(['Familiar', 'Almost Mine', 'Mine'] as const).map((state, i) => <button type="button" className="rating-button" key={state} aria-pressed={value === state} onClick={() => onChange(state)}><strong>{state}</strong><span>{['I understand it', 'I can use it with support', 'I can use it naturally'][i]}</span></button>)}</fieldset>;
}
