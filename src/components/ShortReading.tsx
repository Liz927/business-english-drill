import { useEffect, useRef, useState } from 'react';
import type { SavedPhrase, ShortReading as Reading, ShortReadingProgress } from '../types';
import { currentAnswer, parseShortReadings, questionFor } from '../lib/shortReading';
import ReadingUnits from './ReadingUnits';

interface Props {
  reading: Reading; readings: Reading[]; progress: ShortReadingProgress; phrases: SavedPhrase[];
  onSelect: (id: string) => void; onImport: (readings: Reading[]) => void;
  onChange: (progress: ShortReadingProgress) => void; onSave: (phrase: SavedPhrase) => void;
  storageError: boolean;
  allProgress: Record<string, ShortReadingProgress>;
}
export default function ShortReading({ reading, readings, progress, phrases, onSelect, onImport, onChange, onSave, storageError, allProgress }: Props) {
  const body = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState('');
  const [message, setMessage] = useState('');
  const [copyText, setCopyText] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const sequence = reading.unit ? readings.filter(r => r.unit?.id === reading.unit!.id).sort((a,b) => a.unit!.lesson - b.unit!.lesson) : readings;
  const index = sequence.findIndex(r => r.id === reading.id);
  const previous = sequence[index - 1];
  const next = sequence[index + 1];
  const answer = currentAnswer(reading, progress);
  const quiz = reading.quiz;
  const sentences = reading.paragraphs.flatMap(p => p.match(/[^.!?]+[.!?]+(?:[’”])?|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [p]);

  useEffect(() => {
    const capture = () => {
      const s = window.getSelection();
      if (s && !s.isCollapsed && s.anchorNode && s.focusNode && body.current?.contains(s.anchorNode) && body.current.contains(s.focusNode)) {
        const text = s.toString().trim();
        if (text && reading.paragraphs.some(p => p.includes(text))) { setSelection(text); setCopyText(''); setCopyMessage(''); }
      }
    };
    document.addEventListener('selectionchange', capture);
    return () => document.removeEventListener('selectionchange', capture);
  }, [reading]);
  useEffect(() => { if (copyText) { fallback.current?.focus(); fallback.current?.select(); } }, [copyText]);

  async function importFile(selected?: File) {
    if (!selected) return;
    setBusy(true); setMessage('');
    try {
      if (selected.size > 200000) throw new Error('请选择小于 200 KB 的短阅读资料包。');
      const incoming = parseShortReadings(await selected.text());
      onImport(incoming);
    } catch (error) { setMessage(error instanceof Error ? error.message : '导入失败，请重试。'); }
    finally { setBusy(false); if (file.current) file.current.value = ''; }
  }
  async function copyQuestion() {
    const text = questionFor(reading, selection, progress.note);
    try { await navigator.clipboard.writeText(text); setCopyText(''); setCopyMessage('已复制。回到和 Evan 的聊天，粘贴后就可以问。'); }
    catch { setCopyText(text); setCopyMessage('未能自动复制。请长按或全选下方文字，手动复制到聊天。'); }
  }
  return <section className="short-reading" aria-label="Today’s short reading">
    <ReadingUnits readings={readings} progress={allProgress} active={reading.id} onSelect={onSelect} onImport={() => file.current?.click()} disabled={busy || storageError}/>
    {message && <p role="alert">{message}</p>}
    <div className="short-heading"><p className="eyebrow">ONE SMALL READING · 今天读这一段</p><span className="tag">约 3–5 分钟 · 不计时</span></div>
    <nav className="reading-pager" aria-label="切换短阅读"><button className="secondary" disabled={!previous} onClick={() => previous && onSelect(previous.id)}>← 上一篇</button><span>{reading.unit ? '本单元 · ' : ''}第 {index + 1} / {sequence.length} 篇</span><button className="secondary" disabled={!next} onClick={() => next && onSelect(next.id)}>下一篇 →</button></nav>
    <label className="reading-picker">选一篇阅读<select value={reading.id} onChange={e => onSelect(e.target.value)}>{readings.map((r,i) => <option key={r.id} value={r.id}>{i + 1}. {r.title}{r.sourceKind === 'personal' ? ' · 我的教材' : ''}</option>)}</select></label>
    <h1 id="current-reading-title" tabIndex={-1}>{reading.title}</h1>
    <p className="short-situation">{reading.situation}</p>
    <p className="fine-print short-source">{reading.sourceKind === 'personal' ? '个人教材摘录' : '原创入门短文'} · {reading.source}<br/>理解题、情境说明、词义提示和仿写为原创辅助练习。</p>

    <details className="short-support"><summary>读前看一眼 · {reading.words.length} 个关键词</summary>
      <p className="muted">先认得意思就好，不用现在背下来。</p>
      <dl>{reading.words.map(w => <div key={w.term}><dt>{w.term}<span>{w.focus === 'keep' ? '值得记住' : '这次看懂即可'}</span></dt><dd>{w.meaning}</dd></div>)}</dl>
    </details>

    <div ref={body} className="short-body" aria-label="Reading passage">{reading.paragraphs.map((p,i) => <p key={i}>{p}</p>)}</div>
    <p className="short-invitation">先读懂在讲什么。遇到不明白的句子，可以选中它，或在下方选择。</p>
    {quiz ? <section className="reading-quiz" aria-label="阅读理解小练习"><p className="eyebrow">READ → CHOOSE → UNDERSTAND</p><h2>读完，试一道题</h2><p className="muted">可以回看原文，也可以跳过。不计时，不影响换篇。</p><fieldset className="options" disabled={answer?.revealed}><legend>{quiz.prompt}</legend>{quiz.options.map((o,i) => <label className={`option ${answer?.choice === i ? 'selected' : ''}`} key={i}><input type="radio" name={`comprehension-${reading.id}`} checked={answer?.choice === i} onChange={() => onChange({ ...progress, comprehension:{ question:JSON.stringify(quiz), choice:i, revealed:false } })}/><span className="option-letter">{'ABCD'[i]}</span><span>{o.text}</span></label>)}</fieldset>
      {!answer?.revealed ? <button className="primary" disabled={!answer} onClick={() => answer && onChange({ ...progress, comprehension:{ ...answer, revealed:true } })}>看答案与解析</button> : <div className="quiz-feedback"><p role="status"><strong>{answer.choice === quiz.answer ? '选对了，我们看看原文依据。' : `你选了 ${'ABCD'[answer.choice]}，更符合原文的是 ${'ABCD'[quiz.answer]}。`}</strong></p><p className="small-label">原文依据</p><blockquote>{quiz.evidence}</blockquote><ol className="quiz-explanations">{quiz.options.map((o,i) => <li key={i}><strong>{'ABCD'[i]} · {i === quiz.answer ? '正确选项' : '为什么不选'}{i === answer.choice ? ' · 你的选择' : ''}</strong><p>{o.explanation}</p></li>)}</ol><button className="text-button" onClick={() => onChange({ ...progress, comprehension:undefined })}>再试一次</button><p className="fine-print">这是原创理解练习，不代表真题成绩。答对也不等于已经掌握。</p></div>}
    </section> : <p className="fine-print">这篇个人材料暂未配理解题，可以直接阅读、收藏，或切换到其他短文练习。</p>}
    <details className="short-support"><summary>有点卡住？展开中文理解提示</summary><p>{reading.hint}</p></details>

    <details className="short-support question-support"><summary>这句不明白 · 带着上下文问 Evan</summary>
      <label>选择卡住的句子<select value={sentences.includes(selection) ? selection : ''} onChange={e => { setSelection(e.target.value); setCopyText(''); setCopyMessage(''); }}><option value="">{selection ? '已使用原文中选中的文字' : '整段都想问 / 选择一句'}</option>{sentences.map((s,i) => <option value={s} key={i}>{s}</option>)}</select></label>
      {selection && <blockquote className="short-quote">{selection}</blockquote>}
      <label>哪里不明白？（可留空，自动保存）<textarea rows={2} maxLength={2000} value={progress.note} placeholder="例如：这里为什么用这个词？" onChange={e => { onChange({ ...progress, note:e.target.value }); setCopyText(''); setCopyMessage(''); }}/></label>
      <button className="secondary" onClick={copyQuestion}>复制句子、上下文和出处</button>
      <p className="fine-print">复制后粘贴到和 Evan 的聊天里；这里不会自动发送。</p>
      <p role="status">{copyMessage}</p>
      {copyText && <label>手动复制提问<textarea ref={fallback} readOnly value={copyText} rows={8}/></label>}
    </details>

    <details className="short-support"><summary>想留下一个表达？看原句再收藏</summary>
      {reading.words.map(w => {
        const saved = phrases.some(p => p.sourceId === reading.id && p.phrase.toLowerCase() === w.term.toLowerCase());
        return <article className="short-word" key={w.term}><div><h3>{w.term}</h3><span className="fine-print">{w.focus === 'keep' ? '值得记住' : '这次看懂即可'}</span></div><p>{w.meaning}</p><blockquote>{w.example}</blockquote><button className="text-button" disabled={saved} onClick={() => onSave({ id:crypto.randomUUID(), phrase:w.term, category:reading.topic, example:w.example, context:reading.paragraphs.join('\n\n'), topic:reading.topic, sourceId:reading.id, sourceTitle:reading.source, note:'', savedAt:new Date().toISOString() })}>{saved ? '已收藏到 Phrase Bank' : '收藏这个表达'}</button></article>;
      })}
    </details>

    <div className="short-finish"><p>读懂这一小段，今天就够了。</p><button className="primary" disabled={storageError} onClick={() => onChange({ ...progress, lastRead:new Date().toISOString() })}>{progress.lastRead ? '再读一次，记下来' : reading.unit ? '记录本课阅读' : '今天读到这里'}</button>{progress.lastRead && <p role="status">{storageError ? '这次更改尚未保存，请先导出备份。' : '阅读记录已保存在这台设备。收藏或完成阅读都不代表已经掌握。'}</p>}</div>
    <div className="reading-next">{next ? <><p>下一篇 · {next.title}</p><button className="secondary" onClick={() => onSelect(next.id)}>继续读下一篇 →</button></> : <><p>已到最后一篇。可以从上方目录重读，也可以今天就停在这里。</p><button className="secondary" disabled={!previous} onClick={() => previous && onSelect(previous.id)}>回到上一篇</button></>}</div>
    <details className="short-support"><summary>还有余力？试着模仿一句（可选）</summary><p>{reading.imitation.prompt}</p><blockquote>{reading.imitation.scaffold}</blockquote><label>我的一句话<textarea rows={2} maxLength={2000} value={progress.imitation} onChange={e => onChange({ ...progress, imitation:e.target.value })}/></label><details><summary>看一个示例</summary><p>{reading.imitation.example}</p></details></details>

    <details className="short-materials"><summary>换一段 / 导入我的学习包</summary><p className="muted">导入一次，原文和阅读记录就留在这台设备；换手机需要重新导入资料包。</p><label>我的短阅读<select value={reading.id} onChange={e => onSelect(e.target.value)}>{readings.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label><label className="short-file">选择短阅读资料包（JSON）<input ref={file} type="file" accept=".json,application/json" disabled={busy || storageError} onChange={e => void importFile(e.target.files?.[0])}/></label><p className="fine-print">重复导入同一篇只更新内容，保留你的笔记和阅读记录。</p><p role="status">{busy ? '正在读取…' : message}</p></details>
  </section>;
}
