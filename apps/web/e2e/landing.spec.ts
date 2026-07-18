import { expect, test } from '@playwright/test';

test.describe('Marketing landing page', () => {
  test('renders the hero and primary calls to action', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('effortless');
    await expect(page.getByRole('link', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('navigates to the signup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });
});
