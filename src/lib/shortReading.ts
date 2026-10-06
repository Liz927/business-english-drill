import type { ShortReading } from '../types';

const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown, max = 3000): x is string => typeof x === 'string' && x.trim().length > 0 && x.length <= max;
export function validShortReading(x: unknown): x is ShortReading {
  return object(x) && text(x.id, 100) && /^[a-z0-9-]+$/.test(x.id) &&
    ['title','topic','source','situation','hint'].every(k => text(x[k])) &&
    ['original','personal'].includes(String(x.sourceKind)) &&
    Array.isArray(x.paragraphs) && x.paragraphs.length > 0 && x.paragraphs.length <= 5 && x.paragraphs.every(p => text(p, 4000)) &&
    Array.isArray(x.words) && x.words.length >= 3 && x.words.length <= 5 &&
    x.words.every(w => object(w) && text(w.term,150) && text(w.meaning) && text(w.example) && ['keep','recognise'].includes(String(w.focus))) &&
    object(x.imitation) && ['prompt','scaffold','example'].every(k => text((x.imitation as Record<string, unknown>)[k]));
}
export function parseShortReadings(raw: string): ShortReading[] {
  if (raw.length > 200000) throw new Error('资料包太大了，请选择小于 200 KB 的短阅读包。');
  let value: unknown;
  try { value = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch { throw new Error('无法读取这个文件，请选择短阅读 JSON 资料包。'); }
  if (!object(value) || value.format !== 'bec-short-readings-v1' || !Array.isArray(value.readings) ||
    value.readings.length < 1 || value.readings.length > 30 || !value.readings.every(validShortReading) ||
    value.readings.some(r => r.sourceKind !== 'personal' || !r.id.startsWith('personal-')) ||
    new Set(value.readings.map(r => r.id)).size !== value.readings.length) {
    throw new Error('资料包格式不完整。需要原文、出处、情境说明和 3–5 个关键词；原有记录未改变。');
  }
  return value.readings;
}
export function questionFor(reading: ShortReading, selection: string, question: string): string {
  const quote = reading.paragraphs.some(p => p.includes(selection.trim())) ? selection.trim() : '';
  return `Evan，我在读这段商务英语，帮我理解一下。\n\n出处：${reading.source}\n标题：${reading.title}\n情境：${reading.situation}\n\n我卡住的句子：\n${quote || '请帮我理解下面这段。'}\n\n原文上下文：\n${reading.paragraphs.join('\n\n')}\n\n我的困惑：${question.trim() || '请解释这句话在这个情境中的意思，并指出值得记住的表达。'}`;
}
