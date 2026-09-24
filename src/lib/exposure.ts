import type { AppData, ExposurePack, ExposureSession, LearningState, SavedPhrase } from '../types.ts';
import { localDate } from './schedule.ts';
export function newExposure(packId: string, date = localDate()): ExposureSession {
  return { id: crypto.randomUUID(), packId, date, stage: 'Absorb', visited: ['Absorb'], choice: null, checked: false, imitation: ['', '', '', ''], recall: '', produce: '', hintLevel: 0 };
}
export function markPhrase(phrase: SavedPhrase, state: LearningState, date = new Date()): SavedPhrase {
  const next = new Date(date); next.setDate(next.getDate() + ({ Familiar: 3, 'Almost Mine': 1, Mine: 7 }[state]));
  return { ...phrase, learningState: state, lastPracticed: date.toISOString(), due: localDate(next), reviewCount: (phrase.reviewCount ?? 0) + 1 };
}
export function phraseReviews(phrases: SavedPhrase[], today = localDate()): SavedPhrase[] {
  const priority = { 'Almost Mine': 0, Familiar: 1, Mine: 2 };
  return phrases.filter(p => p.learningState && (!p.due || p.due <= today))
    .sort((a,b) => priority[a.learningState!] - priority[b.learningState!] || (a.due ?? '').localeCompare(b.due ?? ''));
}
// Keep each pack's draft, including the original single-pack session from v1.
export function openPack(data: AppData, packId: string, today = localDate()): AppData {
  const drafts = { ...data.exposureDrafts };
  if (data.exposureSession) drafts[data.exposureSession.packId] = data.exposureSession;
  const previous = drafts[packId];
  const session = previous ? { ...previous, ...(previous.date !== today ? { id: crypto.randomUUID(), date: today, visited: [previous.stage] } : {}) } : newExposure(packId, today);
  return { ...data, exposureDrafts: { ...drafts, [packId]: session }, exposureSession: session };
}
export function recommendPack(packs: ExposurePack[], data: AppData): ExposurePack {
  const current = data.exposureSession;
  if (current && !(data.exposureHistory ?? []).some(h => h.id === current.id)) {
    const active = packs.find(p => p.id === current.packId);
    if (active) return active;
  }
  const last = new Map<string, string>();
  for (const h of data.exposureHistory ?? []) if ((last.get(h.packId) ?? '') < h.at) last.set(h.packId, h.at);
  return [...packs].sort((a,b) => (last.get(a.id) ?? '').localeCompare(last.get(b.id) ?? ''))[0];
}
