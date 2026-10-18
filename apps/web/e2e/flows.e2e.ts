import { expect, test } from '@playwright/test';

test('Learn: groups start closed and open a written topic', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Topics mastered in year 1')).toBeVisible();
  const foundations = page.locator('details.group').first();
  await expect(foundations).not.toHaveAttribute('open', '');
  await foundations.locator('summary').click();
  await foundations.getByRole('link', { name: /Linear functions in economics/ }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Linear functions in economics' }),
  ).toBeVisible();
  await expect(page.locator('.katex').first()).toBeVisible();
});

test('Topic: worked examples explain each step without the internet', async ({ page }) => {
  await page.goto('/topic/C107');
  await page.getByRole('tab', { name: 'Examples' }).click();
  const why = page.getByRole('button', { name: 'Why?' }).first();
  await why.click();
  await expect(why).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.why').first()).toBeVisible();
});

test('Practice: a timed test, results with explanations, saved to Progress', async ({ page }) => {
  await page.goto('/practice?topic=C107');
  await page.getByRole('button', { name: 'Start test' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  // AI and the tab bar are hidden while the test runs.
  await expect(page.locator('.tabbar')).toBeHidden();
  page.on('dialog', (d) => d.accept());
  for (let i = 0; i < 5; i++) {
    await page.getByLabel('Your answer').fill(String(i));
    await page.locator('.runner-nav .button-primary').click();
  }
  await expect(page.getByText('Your score', { exact: true })).toBeVisible();
  await expect(page.getByText('Correct answer').first()).toBeVisible();
  await page.getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByText(/1 test taken/)).toBeVisible();
});

test('Settings: the Azerbaijan programme changes Learn', async ({ page }) => {
  await page.goto('/settings');
  // The choice is saved on the device first, then the radio follows; so click and wait.
  const azerbaijan = page.getByLabel(/Azerbaijan: 050405 Economics/);
  await azerbaijan.click();
  await expect(azerbaijan).toBeChecked();
  await page.getByRole('link', { name: 'Learn' }).click();
  await expect(page.getByText('Linear Algebra and Mathematical Analysis')).toBeVisible();
});

test('Offline: after the first visit the app works without a network', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await context.setOffline(true);
  await page.goto('/topic/C107');
  await expect(page.getByText('Common mistakes')).toBeVisible();
  await page.getByLabel('Your question').fill('Why is elasticity negative?');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText(/No internet/)).toBeVisible();
});
