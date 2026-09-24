// Optional acceptance check. Uses an installed Playwright and Edge, no app dependency.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DRILL_TEST_URL || 'http://localhost:4173';
const key = 'business-english-drill:v1';

(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Shanghai' });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const nav = name => page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
  const state = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
  try {
    await page.goto(base); await page.waitForLoadState('networkidle');
    console.log('Rendered buttons:', await page.locator('button').allTextContents());
    await noOverflow(); await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByText('Ready to write? Original output practice', { exact: true }).click();
    await page.getByRole('button', { name: 'Start output practice', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Compare responses' })).toBeDisabled();
    assert.equal(await page.locator('[lang="zh-CN"]').count(), 0);
    await page.getByRole('button', { name: 'Need a hint?' }).click();
    await expect(page.locator('[lang="zh-CN"]')).toBeVisible();
    await page.getByLabel('Your response').fill('Could we confirm the requirement before we agree on a date?');
    const originalIds = (await state()).session.ids;
    await page.reload(); await page.getByText('Ready to write? Original output practice', { exact: true }).click(); await page.getByRole('button', { name: 'Continue output practice' }).click();
    await expect(page.getByLabel('Your response')).toHaveValue('Could we confirm the requirement before we agree on a date?');
    assert.deepEqual((await state()).session.ids, originalIds);
    await page.screenshot({ path: 'test-results/exercise-mobile.png', fullPage: true });
    for (let i = 0; i < 5; i++) {
      const isTone = await page.getByRole('radio').count() > 0;
      if (isTone) {
        await expect(page.getByRole('button', { name: 'Check choice' })).toBeDisabled();
        await page.getByRole('radio').first().check();
        await page.getByRole('button', { name: 'Check choice' }).click();
        await expect(page.locator('.option-feedback p')).toHaveCount(4);
      } else {
        await page.getByLabel('Your response').fill('Could you confirm the next step and owner by Friday? This will help us protect the agreed timeline.');
        await page.getByRole('button', { name: 'Compare responses' }).click();
      }
      await expect(page.getByRole('heading', { name: 'How did that feel?' })).toBeVisible();
      if (i === 0) {
        await page.getByRole('button', { name: 'Save phrase', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeDisabled();
        await page.reload(); await page.getByText('Ready to write? Original output practice', { exact: true }).click(); await page.getByRole('button', { name: 'Continue output practice' }).click();
        await expect(page.getByRole('heading', { name: 'How did that feel?' })).toBeVisible();
        await page.screenshot({ path: 'test-results/answer-mobile.png', fullPage: true });
      }
      await noOverflow();
      await page.getByRole('button', { name: ['Difficult Tomorrow', 'Hesitated In 3 days', 'Easy In 7 days', 'Difficult Tomorrow', 'Easy In 7 days'][i], exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: 'Good. Go to work.' })).toBeVisible();
    let saved = await state();
    assert.equal(saved.attempts.length, 5); assert.equal(saved.completedDates.length, 1); assert.equal(saved.phrases.length, 1);
    for (const attempt of saved.attempts) {
      const due = await page.evaluate(({at,rating}) => { const d = new Date(at); d.setDate(d.getDate() + ({Easy:7,Hesitated:3,Difficult:1}[rating])); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }, attempt);
      assert.equal(saved.reviews[attempt.questionId].due, due);
    }
    await page.reload();
    await expect(page.getByRole('heading', { name: 'When sales rise but margins fall.', level: 1 })).toBeVisible();
    assert.equal(await page.getByRole('button', { name: 'Start', exact: true }).count(), 0);
    await nav('Phrase Bank');
    await page.getByLabel('Personal note').fill('Use this in the next vendor call.');
    await page.getByRole('searchbox').fill('vendor call'); await expect(page.locator('.saved-phrase')).toHaveCount(1);
    await page.getByRole('searchbox').fill('no-such-phrase'); await expect(page.getByRole('heading', { name: 'No matching phrases' })).toBeVisible();
    await page.getByRole('searchbox').fill('');
    await page.getByLabel('Filter by category').selectOption(saved.phrases[0].category);
    await expect(page.locator('.saved-phrase')).toHaveCount(1);
    await page.reload(); await nav('Phrase Bank');
    await expect(page.getByLabel('Personal note')).toHaveValue('Use this in the next vendor call.');
    await nav('Progress'); await expect(page.locator('.module-row')).toHaveCount(10);
    await expect(page.locator('.metrics')).toContainText('60%');
    await page.screenshot({ path: 'test-results/progress-mobile.png', fullPage: true });
    console.log('PASS: daily session, phrase bank, progress');
    await nav('Settings'); await page.getByRole('combobox', { name: 'Appearance', exact: true }).selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await page.getByRole('switch', { name: 'Chinese rescue hints' }).click();
    const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export data' }).click();
    const download = await downloadPromise; assert.ok(download.suggestedFilename().endsWith('.json'));
    await page.getByRole('button', { name: 'Reset data', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible(); await page.getByRole('button', { name: 'Keep my data' }).click();
    assert.equal((await state()).attempts.length, 5);
    await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await page.screenshot({ path: 'test-results/home-dark-mobile.png', fullPage: true });
    console.log('PASS: settings, theme, export, reset cancellation');
    // Fixture: move review dates into the past to exercise a real due-review run.
    await page.evaluate(k => { const d=JSON.parse(localStorage.getItem(k)); Object.values(d.reviews).forEach(r => r.due='2026-01-01'); localStorage.setItem(k,JSON.stringify(d)); }, key);
    await page.reload(); await page.getByRole('navigation').getByRole('button', { name: /Review/ }).click();
    await expect(page.locator('.review-row')).toHaveCount(5);
    await expect(page.locator('.review-row').first()).toContainText('Difficult');
    await page.getByRole('button', { name: 'Start review' }).click();
    assert.equal(await page.getByRole('button', { name: 'Need a hint?' }).count(), 0);
    await page.getByRole('button', { name: 'Save & exit', exact: false }).click();
    await page.reload(); await page.getByRole('navigation').getByRole('button', { name: /Review/ }).click();
    await page.getByRole('button', { name: 'Continue review' }).click();
    for (let i=0;i<5;i++) {
      if (await page.getByRole('radio').count()) { await page.getByRole('radio').first().check(); await page.getByRole('button', { name: 'Check choice' }).click(); }
      else { await page.getByLabel('Your response').fill('Could you confirm the owner and due date?'); await page.getByRole('button', { name: 'Compare responses' }).click(); }
      await page.getByRole('button', { name: 'Easy In 7 days', exact: true }).click();
    }
    assert.equal((await state()).attempts.length, 10); assert.equal((await state()).completedDates.length, 1);
    await nav('Review'); await expect(page.getByRole('heading', { name: 'You’re all caught up.' })).toBeVisible();
    console.log('PASS: due reviews, resume, scheduling after review');
    // Service worker acceptance: control, offline navigation reload, and persisted data.
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload(); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const manifest = await page.evaluate(async () => (await fetch(new URL('manifest.webmanifest', document.baseURI))).json());
    assert.equal(manifest.display, 'standalone'); assert.equal(manifest.icons.length, 3);
    for (const icon of manifest.icons) assert.equal((await page.request.get(new URL(icon.src, base.replace(/\/?$/, '/') + 'manifest.webmanifest').href)).status(),200);
    await context.setOffline(true); await page.reload();
    await expect(page.getByRole('heading', { name: 'When sales rise but margins fall.', level: 1 })).toBeVisible();
    await nav('Phrase Bank'); await expect(page.getByLabel('Personal note')).toHaveValue('Use this in the next vendor call.');
    await page.getByLabel('Personal note').fill('Updated while offline.');
    await page.reload(); await nav('Phrase Bank'); await expect(page.getByLabel('Personal note')).toHaveValue('Updated while offline.');
    await context.setOffline(false);
    // Narrow viewport and 200% text sizing should reflow without horizontal scroll.
    await page.setViewportSize({ width: 320, height: 720 });
    for (const item of ['Today','Phrase Bank','Progress','Settings','Review']) { await nav(item); await noOverflow(); }
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    for (const item of ['Today','Phrase Bank','Progress','Settings','Review']) { await nav(item); await noOverflow(); }
    await context.close();
    // Corrupt storage must not be silently overwritten.
    const corrupt = await browser.newContext(); const cp = await corrupt.newPage();
    await cp.addInitScript(k => localStorage.setItem(k,'{broken'), key);
    await cp.goto(base); await expect(cp.getByRole('alert')).toContainText('preserved');
    assert.equal(await cp.evaluate(k => localStorage.getItem(k),key),'{broken'); await corrupt.close();
    // Storage failure should be visible instead of claiming a successful save.
    const failure = await browser.newContext(); const fp = await failure.newPage();
    await fp.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Full','QuotaExceededError'); }; });
    await fp.goto(base); await expect(fp.getByRole('alert')).toContainText('could not save'); await failure.close();
    assert.deepEqual(errors, []);
    console.log('PASS: daily completion, four exercise types, hint, draft/reveal persistence, phrase save/search/filter/note, metrics, theme, export, reset cancellation, due review/resume, offline reload/write, manifest assets, narrow viewport, corrupt storage, quota failure.');
    console.log('Native iPhone Safari installation and native WebMCP are not covered by this Edge acceptance test.');
  } catch (error) {
    if (!page.isClosed()) { await page.screenshot({ path: 'test-results/failure.png', fullPage: true }); console.error(await page.locator('main').ariaSnapshot()); }
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
