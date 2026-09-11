import test from 'node:test';
import assert from 'node:assert/strict';
import { exercises } from '../data/exercises.ts';
import { categories } from '../types.ts';
test('40 distinct exercises cover each module and exercise type', () => {
  assert.ok(exercises.length >= 40);
  assert.equal(new Set(exercises.map(q => q.id)).size, exercises.length);
  for (const category of categories) {
    assert.equal(new Set(exercises.filter(q => q.category === category).map(q => q.type)).size, 4, category);
  }
  for (const q of exercises) {
    for (const value of [q.scenario,q.prompt,q.modelAnswer,q.alternativeAnswer,q.explanation,q.hintZh]) assert.ok(value.trim().length > 15, q.id);
    assert.ok(q.phrases.length > 0 && q.tags.length > 0, q.id);
    if (q.type === 'tone') {
      assert.equal(q.options?.length, 4, q.id);
      assert.ok(Number.isInteger(q.preferredAnswer) && q.preferredAnswer! >= 0 && q.preferredAnswer! < q.options!.length, q.id);
      assert.equal(q.options![q.preferredAnswer!].text, q.modelAnswer, q.id);
      q.options!.forEach(o => assert.ok(o.explanation.length > 15, q.id));
    }
  }
});
