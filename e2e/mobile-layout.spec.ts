import { test, expect } from '@playwright/test';

test.describe('Mobile layout and centering tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('barista_active_profile_id', 'carlos');
    });
  });

  test('header has no "Laboratorio Especialidad" badge and shows BARISTA brand', async ({ page }) => {
    await page.goto('/');

    // Check header brand title
    const brandTitle = page.locator('header h1');
    await expect(brandTitle).toHaveText('BARISTA');

    // Ensure the badge was removed
    await expect(page.locator('text=Laboratorio Especialidad')).toHaveCount(0);
    await expect(page.locator('text=Specialty Lab')).toHaveCount(0);
  });

  test('no horizontal overflow / screen is properly centered on mobile viewports', async ({ page }) => {
    await page.goto('/');

    // Wait for the main page to load
    await expect(page.locator('header')).toBeVisible();

    // Verify there is no horizontal scroll/overflow
    const overflow = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      return {
        scrollWidth,
        clientWidth,
        hasOverflow: scrollWidth > clientWidth,
      };
    });

    expect(overflow.hasOverflow).toBe(false);
  });

  test('header actions fit within viewport without clipping', async ({ page }, testInfo) => {
    await page.goto('/');

    const viewportSize = page.viewportSize();
    const viewportWidth = viewportSize?.width ?? 390;

    // Check header bounding box
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    if (headerBox) {
      expect(headerBox.width).toBeLessThanOrEqual(viewportWidth);
    }

    // Profile switch button and Language toggle must be visible
    const langBtn = page.getByRole('button', { name: /Toggle language/i });
    await expect(langBtn).toBeVisible();

    const langBox = await langBtn.boundingBox();
    expect(langBox).not.toBeNull();
    if (langBox) {
      expect(langBox.x + langBox.width).toBeLessThanOrEqual(viewportWidth + 2);
    }

    if (testInfo.project.name.includes('iPhone 13')) {
      await page.screenshot({
        path: '/Users/spcarlos33/.gemini/antigravity/brain/035c9c01-82db-4363-8ebd-d7da9eba79d3/mobile_fixed.png',
      });
    }
  });
});
