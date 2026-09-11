import type { AppData, Session } from '../types';
export const STORAGE_KEY = 'business-english-drill:v1';
export function emptyData(): AppData {
  return { version: 1, theme: 'system', rescue: true, attempts: [], reviews: {}, phrases: [], completedDates: [], session: null, reviewSession: null };
}
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === 'string';
const rating = (x: unknown) => x === 'Easy' || x === 'Hesitated' || x === 'Difficult';
const validSession = (x: unknown): x is Session | null => x === null || (record(x) && text(x.date) && Array.isArray(x.ids) && x.ids.every(text) && Number.isInteger(x.index) && Number(x.index) >= 0 && Number(x.index) <= x.ids.length && text(x.response) && (x.choice === null || Number.isInteger(x.choice)) && typeof x.revealed === 'boolean' && typeof x.hint === 'boolean');
export function validData(x: unknown): x is AppData {
  return record(x) && x.version === 1 && ['system','light','dark'].includes(String(x.theme)) && typeof x.rescue === 'boolean'
    && Array.isArray(x.attempts) && x.attempts.every(a => record(a) && text(a.questionId) && rating(a.rating) && text(a.at) && text(a.response) && ['daily','review'].includes(String(a.mode)) && (a.choice === null || Number.isInteger(a.choice)))
    && record(x.reviews) && Object.values(x.reviews).every(r => record(r) && text(r.questionId) && rating(r.rating) && text(r.due) && text(r.lastReviewed))
    && Array.isArray(x.phrases) && x.phrases.every(p => record(p) && ['id','phrase','category','example','note','savedAt'].every(k => text(p[k])))
    && Array.isArray(x.completedDates) && x.completedDates.every(text) && validSession(x.session) && validSession(x.reviewSession);
}
export function loadData(): { data: AppData; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyData(), error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!validData(parsed)) throw new Error('Invalid data');
    return { data: parsed, error: null };
  } catch {
    return { data: emptyData(), error: 'Saved data could not be read. Your stored copy has been preserved. Export it in Settings before resetting; new practice will not be saved until this is resolved.' };
  }
}
export function downloadData(data: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
