import type { AppData, Session } from '../types';
import { stages } from '../types.ts';
export const STORAGE_KEY = 'business-english-drill:v1';
export function emptyData(): AppData {
  return { version: 1, theme: 'system', rescue: true, attempts: [], reviews: {}, phrases: [], completedDates: [], session: null, reviewSession: null, exposureSession: null, exposureHistory: [] };
}
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === 'string';
const rating = (x: unknown) => x === 'Easy' || x === 'Hesitated' || x === 'Difficult';
const stage = (x: unknown) => stages.includes(x as typeof stages[number]);
const optionalText = (x: unknown) => x === undefined || text(x);
const textArray = (x: unknown) => x === undefined || (Array.isArray(x) && x.every(text));
const validExposure = (x: unknown) => x === undefined || x === null || (record(x) && ['id','packId','date','recall','produce'].every(k => text(x[k])) && stage(x.stage) && Array.isArray(x.visited) && x.visited.every(stage) && (x.choice === null || (Number.isInteger(x.choice) && Number(x.choice) >= 0 && Number(x.choice) < 4)) && typeof x.checked === 'boolean' && Array.isArray(x.imitation) && x.imitation.length === 4 && x.imitation.every(text) && Number.isInteger(x.hintLevel) && Number(x.hintLevel) >= 0 && Number(x.hintLevel) <= 4 && (x.recallFeeling === undefined || ['Hesitated','Comfortable'].includes(String(x.recallFeeling))));
const validSession = (x: unknown): x is Session | null => x === null || (record(x) && text(x.date) && Array.isArray(x.ids) && x.ids.every(text) && Number.isInteger(x.index) && Number(x.index) >= 0 && Number(x.index) <= x.ids.length && text(x.response) && (x.choice === null || Number.isInteger(x.choice)) && typeof x.revealed === 'boolean' && typeof x.hint === 'boolean');
export function validData(x: unknown): x is AppData {
  return record(x) && x.version === 1 && ['system','light','dark'].includes(String(x.theme)) && typeof x.rescue === 'boolean'
    && Array.isArray(x.attempts) && x.attempts.every(a => record(a) && text(a.questionId) && rating(a.rating) && text(a.at) && text(a.response) && ['daily','review'].includes(String(a.mode)) && (a.choice === null || Number.isInteger(a.choice)))
    && record(x.reviews) && Object.values(x.reviews).every(r => record(r) && text(r.questionId) && rating(r.rating) && text(r.due) && text(r.lastReviewed))
    && Array.isArray(x.phrases) && x.phrases.every(p => record(p) && ['id','phrase','category','example','note','savedAt'].every(k => text(p[k])) && ['context','tone','pattern','lastPracticed','due','topic','sourceTitle','sourceId'].every(k => optionalText(p[k])) && textArray(p.examples) && textArray(p.tags) && (p.learningState === undefined || ['Familiar','Almost Mine','Mine'].includes(String(p.learningState))) && (p.reviewCount === undefined || (Number.isInteger(p.reviewCount) && Number(p.reviewCount) >= 0)))
    && Array.isArray(x.completedDates) && x.completedDates.every(text) && validSession(x.session) && validSession(x.reviewSession)
    && validExposure(x.exposureSession) && (x.exposureHistory === undefined || (Array.isArray(x.exposureHistory) && x.exposureHistory.every(h => record(h) && ['id','packId','date','at'].every(k => text(h[k])) && Array.isArray(h.stages) && h.stages.every(stage))))
    && (x.exposureDrafts === undefined || (record(x.exposureDrafts) && Object.entries(x.exposureDrafts).every(([id,s]) => record(s) && s.packId === id && validExposure(s))))
    && (x.readings === undefined || (Array.isArray(x.readings) && x.readings.every(r => record(r) && ['id','title','topic','source','text','note','savedAt'].every(k => text(r[k])) && optionalText(r.lastRead))));
}
export function loadData(): { data: AppData; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyData(), error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!validData(parsed)) throw new Error('Invalid data');
    return { data: { ...parsed, exposureSession: parsed.exposureSession ?? null, exposureHistory: parsed.exposureHistory ?? [] }, error: null };
  } catch {
    return { data: emptyData(), error: 'Saved data could not be read. Your stored copy has been preserved. Export it in Settings before resetting; new practice will not be saved until this is resolved.' };
  }
}
export function downloadData(data: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
