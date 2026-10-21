import type { ShortReading, ShortReadingProgress } from '../types';
import { readingUnits, resumeReading } from '../lib/shortReading';

interface Props {
  readings: ShortReading[]; progress: Record<string, ShortReadingProgress>; active: string;
  onSelect: (id: string) => void; onImport: () => void; disabled: boolean;
}
export default function ReadingUnits({ readings, progress, active, onSelect, onImport, disabled }: Props) {
  const units = readingUnits(readings);
  function openLesson(id: string) {
    onSelect(id);
    // Wait for the selected passage to render, including when it is already active.
    window.setTimeout(() => {
      const title = document.getElementById('current-reading-title');
      title?.scrollIntoView({ block:'start' });
      title?.focus({ preventScroll:true });
    },0);
  }
  return <section className="reading-units" aria-label="我的学习单元">
    <div className="unit-heading"><p className="eyebrow">MY LEARNING · 我的学习单元</p><button className="text-button" disabled={disabled} onClick={onImport}>导入学习包</button></div>
    {!units.length && <p className="muted">一周资料只需导入一次，就能按课继续学。下方已有 {readings.length} 篇短阅读，可以先试读。</p>}
    {units.map(lessons => {
      const unit = lessons[0].unit!;
      const done = lessons.filter(r => progress[r.id]?.lastRead).length;
      const next = resumeReading(lessons,progress,active);
      return <article className="reading-unit" key={unit.id}>
        <h2>{unit.title}</h2><p className="unit-status">已记录 {done} / {lessons.length} 课 · 每次一课，随时可重读</p>
        <progress aria-label={`${unit.title}阅读进度`} value={done} max={lessons.length}/>
        {next ? <button className="secondary unit-resume" onClick={() => openLesson(next.id)}>继续学习 · 第 {next.unit!.lesson} 课</button> : <p className="unit-complete" role="status">这一周读完了。可以从目录重读，或带着笔记来问 Evan。</p>}
        <details className="unit-directory"><summary>查看 {lessons.length} 课目录</summary><ol>{lessons.map(r => <li key={r.id}><button aria-current={r.id === active ? 'step' : undefined} onClick={() => openLesson(r.id)}><span className="unit-number">{r.unit!.lesson}</span><span>{r.title}<small>{progress[r.id]?.lastRead ? '已记录阅读' : r.id === active ? '正在读' : '未记录'}</small></span></button></li>)}</ol></details>
      </article>;
    })}
    <p className="fine-print">资料和进度保存在当前浏览器；换设备需导入资料，学习记录可在 Settings 导出备份。不按日期锁课。</p>
  </section>;
}
