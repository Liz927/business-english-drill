import test from 'node:test';
import assert from 'node:assert/strict';
import { becPacks, allPacks } from '../data/bec.ts';
import { openPack, recommendPack, newExposure } from './exposure.ts';
import { emptyData, validData } from './storage.ts';

test('six distinct business topics contain coherent texts and complete supported practice', () => {
  assert.equal(new Set(becPacks.map(p => p.topic)).size,6);
  assert.equal(new Set(allPacks.map(p => p.id)).size,allPacks.length);
  for (const pack of becPacks) {
    const text = pack.reading!.paragraphs.join(' ');
    assert.ok(text.split(/\s+/).length >= 150,pack.id);
    assert.equal(pack.imitations.length,4);
    assert.equal(pack.phrases.length,4);
    for (const phrase of pack.phrases) assert.ok(text.toLowerCase().includes(phrase.phrase.toLowerCase()),`${pack.id}: quoted phrase missing from text: ${phrase.phrase}`);
    assert.equal(pack.choice.options.length,4);
    assert.ok(pack.choice.preferred >= 0 && pack.choice.preferred < 4);
    assert.ok(pack.choice.options.every(o => o.explanation.length > 20));
    assert.equal(pack.recallHints!.length,3);
    assert.ok(pack.reading!.glossary.length >= 3);
  }
});
test('switching packs preserves the previous single-pack draft, notes, stages and answers', () => {
  const original = { ...newExposure('challenge-timeline-1','2026-09-24'), produce: 'Keep this response', recall: 'Keep this too' };
  const initial = { ...emptyData(), exposureSession: original };
  const switched = openPack(initial,becPacks[0].id,'2026-09-24');
  assert.deepEqual(switched.exposureDrafts!['challenge-timeline-1'],original);
  const resumed = openPack(switched,'challenge-timeline-1','2026-09-24');
  assert.deepEqual(resumed.exposureSession,original);
  assert.ok(resumed.exposureDrafts![becPacks[0].id]);
  const tomorrow = openPack(resumed,'challenge-timeline-1','2026-09-25');
  assert.equal(tomorrow.exposureSession!.produce,original.produce);
  assert.notEqual(tomorrow.exposureSession!.id,original.id);
  assert.equal(tomorrow.exposureSession!.date,'2026-09-25');
  assert.equal(validData(tomorrow),true);
});
test('recommendation resumes unfinished reading and expands coverage after a recorded visit', () => {
  const data = openPack(emptyData(),becPacks[2].id,'2026-09-24');
  assert.equal(recommendPack(becPacks,data).id,becPacks[2].id);
  data.exposureHistory = [{ id:data.exposureSession!.id, packId:becPacks[2].id, date:'2026-09-24', stages:['Absorb'], at:'2026-09-24T10:00:00Z' }];
  assert.equal(recommendPack(becPacks,data).id,becPacks[0].id);
});
test('new stored reading and draft fields are validated without weakening old recovery', () => {
  assert.equal(validData({ ...emptyData(), readings: [{id:'r',title:'Book',topic:'People',source:'Unit 2',text:'My text',note:'My note',savedAt:'2026-09-24'}] }),true);
  assert.equal(validData({ ...emptyData(),readings:[{text:4}] }),false);
  assert.equal(validData({ ...emptyData(),exposureDrafts:{ bad:null } }),false);
  assert.equal(validData({ ...emptyData(),exposureDrafts:{ wrong:newExposure('different') } }),false);
});
