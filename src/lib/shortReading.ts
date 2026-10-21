import type { AppData, ShortReading, ShortReadingProgress } from '../types';

const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown, max = 3000): x is string => typeof x === 'string' && x.trim().length > 0 && x.length <= max;
export function validQuiz(x: unknown): boolean {
  return object(x) && text(x.prompt) && text(x.evidence,4000) && Number.isInteger(x.answer) && Number(x.answer) >= 0 && Number(x.answer) < 4 &&
    Array.isArray(x.options) && x.options.length === 4 && x.options.every(o => object(o) && text(o.text) && text(o.explanation));
}
export function validComprehension(x: unknown): boolean {
  return x === undefined || (object(x) && text(x.question,40000) && Number.isInteger(x.choice) && Number(x.choice) >= 0 && Number(x.choice) < 4 && typeof x.revealed === 'boolean');
}
export function currentAnswer(reading: ShortReading, progress: ShortReadingProgress) {
  // A changed imported question must not display feedback for an older answer.
  return reading.quiz && progress.comprehension?.question === JSON.stringify(reading.quiz) ? progress.comprehension : undefined;
}
export function validShortReading(x: unknown): x is ShortReading {
  return object(x) && text(x.id, 100) && /^[a-z0-9-]+$/.test(x.id) &&
    (x.unit === undefined || (object(x.unit) && text(x.unit.id,100) && /^[a-z0-9-]+$/.test(x.unit.id) && text(x.unit.title,150) &&
      Number.isInteger(x.unit.lesson) && Number.isInteger(x.unit.total) && Number(x.unit.lesson) >= 1 && Number(x.unit.lesson) <= Number(x.unit.total) && Number(x.unit.total) <= 30)) &&
    ['title','topic','source','situation','hint'].every(k => text(x[k])) &&
    ['original','personal'].includes(String(x.sourceKind)) &&
    Array.isArray(x.paragraphs) && x.paragraphs.length > 0 && x.paragraphs.length <= 5 && x.paragraphs.every(p => text(p, 4000)) &&
    Array.isArray(x.words) && x.words.length >= 3 && x.words.length <= 5 &&
    x.words.every(w => object(w) && text(w.term,150) && text(w.meaning) && text(w.example) && ['keep','recognise'].includes(String(w.focus))) &&
    object(x.imitation) && ['prompt','scaffold','example'].every(k => text((x.imitation as Record<string, unknown>)[k])) &&
    (x.quiz === undefined || (validQuiz(x.quiz) && x.paragraphs.some(p => p.includes((x.quiz as { evidence: string }).evidence))));
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
  for (const unit of readingUnits(value.readings)) {
    const first = unit[0].unit!;
    if (unit.length !== first.total || unit.some((r,i) => r.unit!.lesson !== i + 1 || r.unit!.title !== first.title || r.unit!.total !== first.total)) {
      throw new Error('这个单元的课次不完整或重复，请选择完整学习包；原有记录未改变。');
    }
  }
  return value.readings;
}
export function readingUnits(readings: ShortReading[]): ShortReading[][] {
  const groups = new Map<string, ShortReading[]>();
  for (const r of readings) if (r.unit) groups.set(r.unit.id, [...(groups.get(r.unit.id) ?? []),r]);
  return [...groups.values()].map(group => group.sort((a,b) => a.unit!.lesson - b.unit!.lesson));
}
export function resumeReading(readings: ShortReading[], progress: Record<string, ShortReadingProgress> = {}, active?: string) {
  return readings.find(r => r.id === active && !progress[r.id]?.lastRead) ?? readings.find(r => !progress[r.id]?.lastRead);
}
export function importReadings(data: AppData, incoming: ShortReading[]): AppData {
  return { ...data, shortReadings:[...(data.shortReadings ?? []).filter(r => !incoming.some(n => n.id === r.id)), ...incoming],
    activeShortReading: incoming.some(r => r.id === data.activeShortReading) ? data.activeShortReading : (resumeReading(incoming,data.shortReadingProgress)?.id ?? incoming[0].id) };
}
export function questionFor(reading: ShortReading, selection: string, question: string): string {
  const quote = reading.paragraphs.some(p => p.includes(selection.trim())) ? selection.trim() : '';
  return `Evan，我在读这段商务英语，帮我理解一下。\n\n出处：${reading.source}\n标题：${reading.title}\n情境：${reading.situation}\n\n我卡住的句子：\n${quote || '请帮我理解下面这段。'}\n\n原文上下文：\n${reading.paragraphs.join('\n\n')}\n\n我的困惑：${question.trim() || '请解释这句话在这个情境中的意思，并指出值得记住的表达。'}`;
}
