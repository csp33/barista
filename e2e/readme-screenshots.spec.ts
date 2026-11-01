import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

test.use({
  viewport: { width: 520, height: 865 },
  deviceScaleFactor: 2,
});

test.describe('README Screenshots Automated Generator', () => {
  test('captures all 5 application views for README documentation', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Run screenshot capture once on Chromium');

    await page.addInitScript(() => {
      localStorage.setItem('barista_active_profile_id', 'carlos');
      localStorage.setItem('barista_lang', 'en');
    });

    await page.route('**/api/profiles/**', async (route, request) => {
      if (request.method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // Hide Next.js Dev Tools floating indicator for clean documentation screenshots
    await page.addStyleTag({
      content: `
        nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] {
          display: none !important;
        }
      `,
    });

    // Wait for client hydration
    await expect(page.locator('header button').filter({ hasText: /Carlos/i }).first()).toBeVisible();

    // Ensure English UI for README screenshots
    const langToggle = page.getByRole('button', { name: /Toggle language/i });
    const currentLang = (await langToggle.textContent()) || '';
    if (currentLang.includes('ES')) {
      await langToggle.click();
      await expect(langToggle).toContainText('EN');
    }

    // Wait for web fonts to finish loading
    await page.evaluate(() => document.fonts.ready);

    // ---------------------------------------------------------
    // 1. Capture 02-coffee-stash.png (Coffee Stash View)
    // ---------------------------------------------------------
    await expect(page.locator('article').filter({ hasText: /Worka Sakaro/i }).first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-coffee-stash.png'),
    });

    // ---------------------------------------------------------
    // 2. Capture 05-add-coffee-scanner.png (Add Coffee Modal)
    // ---------------------------------------------------------
    const addCoffeeBtn = page.locator('button').filter({ hasText: /Add Coffee|Añadir Café/i }).first();
    await addCoffeeBtn.click();
    await expect(page.locator('text=/Scan Bag Label|Escanear Bolsa/i').first()).toBeVisible();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-add-coffee-scanner.png'),
    });

    // Close Add Coffee Modal
    const closeAddModalBtn = page.locator('.fixed.inset-0 button').first();
    await closeAddModalBtn.click();

    // ---------------------------------------------------------
    // 3. Capture 01-dial-in-station.png (Dial-In Station View)
    // ---------------------------------------------------------
    const workaCard = page.locator('article').filter({ hasText: /Worka Sakaro/i }).first();
    await workaCard.click();
    await expect(page.locator('text=/DF64/i').first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-dial-in-station.png'),
    });

    // ---------------------------------------------------------
    // 4. Capture 04-shot-feedback.png (Sensory Feedback Modal)
    // ---------------------------------------------------------
    const pullShotBtn = page.locator('button').filter({ hasText: /Pull Shot|Tirar Espresso/i }).first();
    await pullShotBtn.click();
    const sourBtn = page.locator('button').filter({ hasText: /Sour|Agrio/i }).first();
    await expect(sourBtn).toBeVisible();
    await sourBtn.click();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-shot-feedback.png'),
    });

    // Close Feedback Modal
    const closeFeedbackBtn = page.locator('.fixed.inset-0 button').first();
    await closeFeedbackBtn.click();

    // ---------------------------------------------------------
    // 5. Capture 03-equipment-specs.png (Equipment Specs View)
    // ---------------------------------------------------------
    const gearTab = page.locator('nav button').filter({ hasText: /My Gear|Mi Equipo/i }).first();
    await gearTab.click();
    await expect(page.locator('text=/Sage Barista Touch Impress/i').first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-equipment-specs.png'),
    });
  });
});
