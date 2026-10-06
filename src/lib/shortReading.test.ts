import test from 'node:test';
import assert from 'node:assert/strict';
import { parseShortReadings, questionFor } from './shortReading.ts';
import { starterReading } from '../data/shortReadings.ts';
import { emptyData, validData } from './storage.ts';

const personal = { ...starterReading, id:'personal-test', sourceKind:'personal' as const };
const bundle = (reading: unknown = personal) => JSON.stringify({ format:'bec-short-readings-v1', readings:[reading] });
test('private import validates structure, sizes and namespace before replacing any content', () => {
  assert.deepEqual(parseShortReadings('\uFEFF' + bundle()),[personal]);
  assert.throws(() => parseShortReadings(bundle({ ...personal, paragraphs:[] })));
  assert.throws(() => parseShortReadings(bundle({ ...personal, words:[{ term:'broken' }] })));
  assert.throws(() => parseShortReadings(bundle(starterReading)));
  assert.throws(() => parseShortReadings('x'.repeat(200001)));
  assert.throws(() => parseShortReadings(JSON.stringify({ format:'bec-short-readings-v1', readings:[personal,personal] })));
});
test('short reading progress is additive to existing notes, exposure drafts and phrases', () => {
  const data = { ...emptyData(), shortReadings:[personal], activeShortReading:personal.id, shortReadingProgress:{ [personal.id]:{ note:'What does this mean?', imitation:'My version', lastRead:'2026-10-06' } } };
  assert.ok(validData(emptyData()));
  assert.ok(validData(JSON.parse(JSON.stringify(data))));
  assert.equal(validData({ ...data, shortReadingProgress:{ bad:{ note:5, imitation:'' } } }),false);
  assert.equal(validData({ ...data, shortReadings:[{ ...personal, paragraphs:[3] }] }),false);
});
test('copied question carries verified quote, full local context, source and user question', () => {
  const question = questionFor(personal,'our profit fell','Why?');
  assert.ok(question.includes(personal.source));
  assert.ok(personal.paragraphs.every(p => question.includes(p)));
  assert.ok(question.includes('我卡住的句子：\nour profit fell'));
  assert.ok(question.includes('我的困惑：Why?'));
  assert.ok(!questionFor(personal,'unrelated page text','').includes('unrelated page text'));
});
