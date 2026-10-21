// Optional acceptance using a local private pack; no textbook content is committed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const packPath = process.env.BEC_WEEK_PACK || 'personal-materials/bec-higher-week-1.json';
const base = process.env.DRILL_TEST_URL || 'http://127.0.0.1:4176/business-english-drill/';
const key = 'business-english-drill:v1';
(async () => {
  const { parseShortReadings } = await import('../src/lib/shortReading.ts');
  const lessons = parseShortReadings(fs.readFileSync(packPath,'utf8'));
  assert.equal(lessons.length,7);
  assert.equal(new Set(lessons.map(r => r.quiz.answer)).size,4);
  for (const r of lessons) {
    assert.ok(r.source.includes('PDF'));
    assert.ok(r.paragraphs.some(p => p.includes(r.quiz.evidence)));
    assert.ok(r.words.every(w => r.paragraphs.some(p => p.includes(w.example))));
  }
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844}});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',e => errors.push(e.message));
  const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  const unit=()=>page.getByRole('region',{name:'我的学习单元'});
  const heading=()=>page.getByRole('heading',{level:1});
  const quiz=()=>page.getByRole('region',{name:'阅读理解小练习'});
  const select=async i=>{await page.getByLabel('选一篇阅读').selectOption(lessons[i].id); await expect(heading()).toHaveText(lessons[i].title);};
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  try {
    fs.mkdirSync('test-results',{recursive:true});
    await page.goto(base); await page.waitForLoadState('networkidle');
    await page.evaluate(k=>{const d=JSON.parse(localStorage.getItem(k));d.phrases=[{id:'legacy',phrase:'Keep this',category:'Align',example:'Legacy example',note:'Old note',savedAt:'2026-09-23'}];localStorage.setItem(k,JSON.stringify(d));},key);
    await page.reload();
    const [chooser]=await Promise.all([page.waitForEvent('filechooser'),unit().getByRole('button',{name:'导入学习包',exact:true}).click()]);
    await chooser.setFiles(packPath);
    await expect(heading()).toHaveText(lessons[0].title);
    await expect(unit()).toContainText('已记录 0 / 7 课');
    await unit().getByRole('button',{name:'继续学习 · 第 1 课',exact:true}).click();
    await expect(heading()).toBeFocused();
    await expect(page.locator('.reading-pager')).toContainText('本单元 · 第 1 / 7 篇');
    await page.getByText('查看 7 课目录',{exact:true}).click();
    await expect(page.locator('.unit-directory li')).toHaveCount(7);
    await page.screenshot({path:'test-results/weekly-directory-mobile.png',fullPage:true});
    await select(2); // Switching and answering never mark lessons complete.
    await quiz().getByRole('radio').nth(1).check();
    await quiz().getByRole('button',{name:'看答案与解析'}).click();
    await expect(page.locator('.quiz-feedback')).toContainText('你选了 B');
    await page.getByText('这句不明白 · 带着上下文问 Evan',{exact:true}).click();
    await page.getByLabel('哪里不明白？').fill('Keep my weekly note');
    await page.reload();
    await expect(heading()).toHaveText(lessons[2].title);
    await expect(unit().getByRole('button',{name:'继续学习 · 第 3 课',exact:true})).toBeVisible();
    await expect(unit()).toContainText('已记录 0 / 7 课');
    await page.getByRole('button',{name:'记录本课阅读',exact:true}).click();
    await expect(unit().getByRole('button',{name:'继续学习 · 第 1 课',exact:true})).toBeVisible();
    await unit().getByRole('button',{name:'继续学习 · 第 1 课',exact:true}).click();
    await expect(heading()).toHaveText(lessons[0].title);
    await expect(heading()).toBeFocused();
    await select(2);
    const before=await state();
    await page.getByLabel('选择短阅读资料包（JSON）').setInputFiles(packPath);
    await expect(heading()).toHaveText(lessons[2].title);
    assert.deepEqual((await state()).shortReadingProgress,before.shortReadingProgress);
    assert.deepEqual((await state()).phrases,before.phrases);
    assert.equal((await state()).shortReadings.length,7);
    // Incomplete unit import is rejected atomically, even from the top import entry.
    await page.getByLabel('选择短阅读资料包（JSON）').setInputFiles({name:'incomplete.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'bec-short-readings-v1',readings:lessons.slice(1)}))});
    await expect(page.getByRole('alert')).toContainText('课次不完整');
    assert.deepEqual(await state(),before);
    for(let i=0;i<lessons.length;i++) {
      await select(i);
      if(await page.getByRole('button',{name:'再试一次',exact:true}).count()) await page.getByRole('button',{name:'再试一次',exact:true}).click();
      await expect(page.locator('.quiz-feedback')).toHaveCount(0);
      await quiz().getByRole('radio').nth(lessons[i].quiz.answer).check();
      await quiz().getByRole('button',{name:'看答案与解析'}).click();
      await expect(page.locator('.quiz-feedback')).toContainText('选对了');
      await expect(page.locator('.quiz-feedback blockquote')).toHaveText(lessons[i].quiz.evidence);
      await page.locator('.short-finish button').click();
      await noOverflow();
    }
    await expect(unit()).toContainText('已记录 7 / 7 课');
    await expect(unit()).toContainText('这一周读完了');
    await expect(page.locator('.reading-pager').getByRole('button',{name:'下一篇 →',exact:true})).toBeDisabled();
    // Last lesson stops at the unit boundary, without entering public demo readings.
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);await page.reload();await select(1);
    await expect(page.locator('.short-body')).toContainText(lessons[1].paragraphs[0]);
    await expect(page.locator('.quiz-feedback')).toContainText('选对了');
    assert.equal((await state()).shortReadingProgress[lessons[2].id].note,'Keep my weekly note');
    await context.setOffline(false);
    for(const width of [320,1280]) {await page.setViewportSize({width,height:900});await noOverflow();}
    await page.getByText('查看 7 课目录',{exact:true}).click();
    await page.screenshot({path:'test-results/weekly-directory-desktop.png',fullPage:true});
    await page.emulateMedia({colorScheme:'dark'});await noOverflow();
    await page.setViewportSize({width:320,height:800});await page.addStyleTag({content:'html{font-size:200%}'});await noOverflow();
    assert.deepEqual(errors,[]);
    console.log('PASS: seven verified-source lessons, top import, directory, answer feedback, completion gaps, resume, all-done state, atomic rejection, reimport and legacy preservation, reload, offline, unit boundary, responsive and dark/large text.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
