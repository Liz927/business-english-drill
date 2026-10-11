import test from 'node:test';
import assert from 'node:assert/strict';
import { currentAnswer, parseShortReadings, questionFor, validShortReading } from './shortReading.ts';
import { starterReading, shortReadings } from '../data/shortReadings.ts';
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
test('short reading sequence has source-grounded questions and varied answer positions', () => {
  assert.equal(new Set(shortReadings.map(r => r.id)).size,shortReadings.length);
  assert.ok(shortReadings.length >= 4);
  assert.equal(new Set(shortReadings.map(r => r.quiz!.answer)).size,4);
  for(const r of shortReadings) {
    assert.ok(validShortReading(r),r.id);
    assert.ok(r.paragraphs.some(p => p.includes(r.quiz!.evidence)),r.id);
    assert.equal(new Set(r.quiz!.options.map(o => o.text)).size,4);
  }
});
test('old packages remain valid; malformed new quizzes are rejected before import', () => {
  assert.equal(parseShortReadings(bundle({ ...personal,quiz:undefined }))[0].quiz,undefined);
  assert.throws(()=>parseShortReadings(bundle({ ...personal,quiz:{ ...personal.quiz,answer:4 } })));
  assert.throws(()=>parseShortReadings(bundle({ ...personal,quiz:{ ...personal.quiz,evidence:'Not in this passage' } })));
});
test('saved answers survive reload but never carry over to changed imported questions', () => {
  const progress={note:'Keep note',imitation:'Keep draft',comprehension:{question:JSON.stringify(personal.quiz),choice:2,revealed:true}};
  const data={...emptyData(),shortReadingProgress:{[personal.id]:progress}};
  assert.ok(validData(JSON.parse(JSON.stringify(data))));
  assert.equal(currentAnswer(personal,progress)?.choice,2);
  assert.equal(currentAnswer({...personal,quiz:{...personal.quiz!,answer:0}},progress),undefined);
  assert.equal(currentAnswer({...personal,quiz:undefined},progress),undefined);
  assert.equal(validData({...data,shortReadingProgress:{x:{...progress,comprehension:{...progress.comprehension,choice:-1}}}}),false);
});
