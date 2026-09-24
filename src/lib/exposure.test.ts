import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, loadData, STORAGE_KEY, validData } from './storage.ts';
import { markPhrase, newExposure, phraseReviews } from './exposure.ts';
import type { SavedPhrase } from '../types.ts';

const phrase: SavedPhrase = { id: 'old-phrase', phrase: 'Could we revisit the plan?', category: 'Challenge', example: 'Could we revisit the launch plan?', note: 'Keep my note', savedAt: '2026-01-01T10:00:00Z' };
test('legacy v1 data loads without losing history, drafts, phrases or settings', () => {
  const legacy = { ...emptyData(), theme: 'dark', phrases: [phrase], completedDates: ['2026-01-01'], attempts: [{ questionId: 'old', rating: 'Hesitated', at: '2026-01-01T10:00:00Z', response: 'My answer', choice: null, mode: 'daily' }], reviews: { old: { questionId: 'old', rating: 'Hesitated', due: '2026-01-04', lastReviewed: '2026-01-01T10:00:00Z' } }, session: { date: '2026-01-01', ids: ['old'], index: 0, response: 'Unfinished draft', choice: null, revealed: false, hint: true } };
  delete legacy.exposureHistory; delete legacy.exposureSession;
  const raw = JSON.stringify(legacy);
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => key === STORAGE_KEY ? raw : null }, configurable: true });
  const { data, error } = loadData();
  assert.equal(error, null);
  for (const [key, value] of Object.entries(legacy)) assert.deepEqual(data[key as keyof typeof data], value);
  assert.deepEqual(data.exposureHistory, []); assert.equal(data.exposureSession, null);
  assert.equal(data.phrases[0].learningState, undefined);
});
test('malformed new fields preserve the stored copy and trigger recovery instead of silent reset', () => {
  const raw = JSON.stringify({ ...emptyData(), exposureSession: { ...newExposure('timeline'), imitation: null } });
  let reads = 0;
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => { reads++; return raw; } }, configurable: true });
  assert.match(loadData().error!, /preserved/); assert.equal(reads, 1);
  assert.equal(validData({ ...emptyData(), phrases: [{ ...phrase, examples: 'bad' }] }), false);
});
test('Almost Mine is prioritized among due phrases; unmarked and future phrases stay out', () => {
  const at = new Date(2026, 11, 31, 12);
  const almost = markPhrase(phrase, 'Almost Mine', at);
  const familiar = markPhrase({ ...phrase, id: 'familiar' }, 'Familiar', at);
  const mine = markPhrase({ ...phrase, id: 'mine' }, 'Mine', at);
  assert.equal(almost.due, '2027-01-01'); assert.equal(familiar.due, '2027-01-03'); assert.equal(mine.due, '2027-01-07');
  assert.deepEqual(phraseReviews([mine, familiar, phrase, almost], '2027-01-03').map(p => p.id), ['old-phrase','familiar']);
  assert.equal(phrase.learningState, undefined); assert.equal(almost.note, phrase.note);
});
