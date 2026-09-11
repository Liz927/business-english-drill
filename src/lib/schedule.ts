import type { AppData, Exercise, Rating, ReviewItem } from '../types.ts';

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function nextReview(rating: Rating, date = new Date()): string {
  const next = new Date(date);
  next.setDate(next.getDate() + ({ Easy: 7, Hesitated: 3, Difficult: 1 }[rating]));
  return localDate(next);
}
export function dueItems(reviews: Record<string, ReviewItem>, today = localDate()): ReviewItem[] {
  const priority = { Difficult: 0, Hesitated: 1, Easy: 2 };
  return Object.values(reviews).filter(item => item.due <= today)
    .sort((a, b) => priority[a.rating] - priority[b.rating] || a.due.localeCompare(b.due) || a.questionId.localeCompare(b.questionId));
}
export function dailyQuestions(exercises: Exercise[], attempts: AppData['attempts'], today = localDate()): string[] {
  const seed = [...today].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  const last = new Map(attempts.map(a => [a.questionId, a.at]));
  const rotated = [...exercises.slice(seed % exercises.length), ...exercises.slice(0, seed % exercises.length)];
  rotated.sort((a, b) => (last.get(a.id) ?? '').localeCompare(last.get(b.id) ?? ''));
  const selected: Exercise[] = [];
  for (const type of ['scenario', 'tone', 'micro', 'rewrite']) {
    const candidates = rotated.filter(q => q.type === type && !selected.some(s => s.id === q.id));
    const next = candidates.find(q => !selected.some(s => s.category === q.category)) ?? candidates[0];
    if (next) selected.push(next);
  }
  const fifth = rotated.find(q => !selected.some(s => s.id === q.id || s.category === q.category)) ?? rotated.find(q => !selected.some(s => s.id === q.id));
  if (fifth) selected.push(fifth);
  return selected.map(q => q.id);
}
