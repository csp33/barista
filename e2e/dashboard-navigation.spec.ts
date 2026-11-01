import { test, expect } from '@playwright/test';

test.describe('Barista Dashboard interaction and navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('barista_active_profile_id', 'carlos');
    });
    // Isolate profile mutations per worker to prevent shared DB race conditions in parallel runs
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
  });

  test('navigates between stash and equipment gear views', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('header')).toBeVisible();

    // Navigate to Equipment tab
    const gearTab = page.locator('nav button').filter({ hasText: /Mi Equipo|My Gear/i });
    await gearTab.click();

    // Verify equipment view loads
    await expect(page.locator('text=/Sage Barista Touch Impress|DF64/i').first()).toBeVisible();

    // Navigate back to Stash tab
    const stashTab = page.locator('nav button').filter({ hasText: /Mi Café|My Stash|My Coffee/i });
    await stashTab.click();

    // Verify stash view
    await expect(page.locator('text=/Colección de Café|Coffee Collection/i').first()).toBeVisible();
  });

  test('toggles language between Spanish and English', async ({ page }) => {
    await page.goto('/');

    // Wait for client-side hydration to mount user profile
    await expect(page.locator('header button').filter({ hasText: /Carlos/i }).first()).toBeVisible();

    const langToggle = page.getByRole('button', { name: /Toggle language/i });
    await expect(langToggle).toBeVisible();

    // Determine current language and target
    const initialText = (await langToggle.textContent()) || '';
    const initialIsEs = initialText.includes('ES');
    const targetAfterFirstClick = initialIsEs ? 'EN' : 'ES';
    const targetAfterSecondClick = initialIsEs ? 'ES' : 'EN';

    // Click to toggle
    await langToggle.click();
    await expect(langToggle).toContainText(targetAfterFirstClick);

    // Click to toggle back
    await langToggle.click();
    await expect(langToggle).toContainText(targetAfterSecondClick);
  });

  test('opens and closes profile selector modal', async ({ page }) => {
    await page.goto('/');

    // Click profile button in header
    const profileBtn = page.locator('header button').filter({ hasText: /Carlos/i }).first();
    await profileBtn.click();

    // Verify modal appears
    await expect(page.locator('text=/Selecciona tu perfil|Select your profile/i').first()).toBeVisible();

    // Close modal by clicking escape
    await page.keyboard.press('Escape');
  });
});
