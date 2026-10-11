const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DRILL_TEST_URL || 'http://127.0.0.1:4175';
const key = 'business-english-drill:v1';
(async()=>{
  const {shortReadings}=await import('../src/data/shortReadings.ts');
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  const pager=()=>page.getByRole('navigation',{name:'切换短阅读'});
  const quiz=()=>page.getByRole('region',{name:'阅读理解小练习'});
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  try{
    fs.mkdirSync('test-results',{recursive:true});
    await page.goto(base);await page.waitForLoadState('networkidle');
    await expect(pager()).toContainText('第 1 / 4 篇');
    await expect(pager().getByRole('button',{name:'← 上一篇',exact:true})).toBeDisabled();
    await expect(quiz().getByRole('button',{name:'看答案与解析'})).toBeDisabled();
    await expect(page.locator('.quiz-feedback')).toHaveCount(0);
    await quiz().getByRole('radio').nth(0).check();
    await pager().getByRole('button',{name:'下一篇 →',exact:true}).click();
    assert.equal((await state()).shortReadingProgress[shortReadings[0].id].lastRead,undefined);
    await expect(page.getByRole('heading',{level:1})).toHaveText('A cheaper supplier?');
    await expect(quiz().getByRole('radio').nth(0)).not.toBeChecked();
    await pager().getByRole('button',{name:'← 上一篇',exact:true}).click();
    await expect(quiz().getByRole('radio').nth(0)).toBeChecked();
    await page.reload();await expect(quiz().getByRole('radio').nth(0)).toBeChecked();
    await quiz().getByRole('button',{name:'看答案与解析'}).click();
    await expect(page.locator('.quiz-feedback')).toContainText('你选了 A，更符合原文的是 B');
    await page.reload();await expect(page.locator('.quiz-feedback')).toContainText('原文依据');
    await quiz().getByRole('button',{name:'再试一次'}).click();
    await expect(page.locator('.quiz-feedback')).toHaveCount(0);
    for(let i=0;i<shortReadings.length;i++){
      const r=shortReadings[i];await expect(page.getByRole('heading',{level:1})).toHaveText(r.title);
      await quiz().getByRole('radio').nth(r.quiz.answer).check();
      await quiz().getByRole('button',{name:'看答案与解析'}).click();
      await expect(page.locator('.quiz-feedback')).toContainText('选对了');
      await expect(page.locator('.quiz-feedback blockquote')).toHaveText(r.quiz.evidence);
      await noOverflow();
      if(i===1) await page.screenshot({path:'test-results/reading-quiz-mobile.png',fullPage:true});
      if(i<shortReadings.length-1) await page.getByRole('button',{name:'继续读下一篇 →',exact:true}).click();
    }
    await expect(pager().getByRole('button',{name:'下一篇 →',exact:true})).toBeDisabled();
    await expect(page.locator('.reading-next')).toContainText('已到最后一篇');
    await page.getByLabel('选一篇阅读').selectOption(shortReadings[1].id);
    await expect(page.locator('.quiz-feedback')).toContainText('persuade 是说服');
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);await page.reload();
    await expect(page.getByRole('heading',{level:1})).toHaveText('A cheaper supplier?');
    await expect(page.locator('.quiz-feedback')).toContainText('选对了');
    await pager().getByRole('button',{name:'下一篇 →',exact:true}).click();
    await expect(page.getByRole('heading',{level:1})).toHaveText(shortReadings[2].title);
    await context.setOffline(false);
    for(const width of [320,1280]){await page.setViewportSize({width,height:900});await noOverflow();}
    await page.screenshot({path:'test-results/reading-quiz-desktop.png',fullPage:true});
    await page.setViewportSize({width:320,height:800});await page.addStyleTag({content:'html{font-size:200%}'});await noOverflow();
    assert.deepEqual(errors,[]);
    console.log('PASS: visible navigation, four grounded quizzes, no early answers, wrong/correct feedback, independent drafts, retry, reload, last-page boundary, no forced completion, offline switching, responsive/large text.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
