import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyQuestions, dueItems, localDate, nextReview } from './schedule.ts';
import type { Exercise, ReviewItem } from '../types.ts';

test('review intervals cross month and year boundaries in local calendar days', () => {
  const date = new Date(2026, 11, 30, 23, 59);
  assert.equal(nextReview('Difficult', date), '2026-12-31');
  assert.equal(nextReview('Hesitated', date), '2027-01-02');
  assert.equal(nextReview('Easy', date), '2027-01-06');
  assert.equal(localDate(date), '2026-12-30');
  assert.equal(nextReview('Difficult', new Date(2028, 1, 28, 12)), '2028-02-29');
});
test('due review includes today, excludes future, and prioritizes weak items', () => {
  const reviews: Record<string, ReviewItem> = {
    a: { questionId: 'a', rating: 'Easy', due: '2026-09-01', lastReviewed: '' },
    b: { questionId: 'b', rating: 'Difficult', due: '2026-09-11', lastReviewed: '' },
    c: { questionId: 'c', rating: 'Hesitated', due: '2026-09-10', lastReviewed: '' },
    d: { questionId: 'd', rating: 'Difficult', due: '2026-09-12', lastReviewed: '' }
  };
  assert.deepEqual(dueItems(reviews, '2026-09-11').map(q => q.questionId), ['b','c','a']);
  assert.deepEqual(dueItems({}, '2026-09-11'), []);
});
test('daily set is stable, unique, and covers all four exercise types', () => {
  const pool = Array.from({ length: 40 }, (_, i) => ({ id: `q${i}`, type: ['scenario','tone','micro','rewrite'][i % 4], category: `category${Math.floor(i / 4)}` })) as unknown as Exercise[];
  const ids = dailyQuestions(pool, [], '2026-09-11');
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
  assert.equal(new Set(ids.map(id => pool.find(q => q.id === id)!.type)).size, 4);
  assert.deepEqual(ids, dailyQuestions(pool, [], '2026-09-11'));
  const attempted = ids.map(questionId => ({ questionId, at: '2026-09-11T10:00:00Z', mode: 'daily' as const, rating: 'Easy' as const, response: 'test', choice: null }));
  assert.ok(dailyQuestions(pool, attempted, '2026-09-12').every(id => !ids.includes(id)));
});
