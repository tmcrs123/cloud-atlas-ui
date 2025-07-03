import { test, expect } from '@playwright/test';

test('add atlas', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByText('Log in').first().click();
  await page.getByRole('button', { name: 'Manage maps' }).click();
  const initialCount = await page.locator('app-card').count()

  await page.getByText('Add Map').click();
  await page.getByRole('textbox', { name: 'The name of your new map' }).click();
  await page.getByRole('textbox', { name: 'The name of your new map' }).fill('Delete me');
  await page.getByRole('button', { name: 'Add map' }).click();

  await expect(page.locator('.loader')).toHaveCount(0)

  const currentCount = await page.locator('app-card').count()
  expect(initialCount.valueOf() + 1).toEqual(currentCount)

  // await expect(page.getByRole('heading', { name: 'Delete me' })).toBeVisible();
  // await page.getByRole('button', { name: 'Manage maps' }).click();
  // await page.getByText('Delete Map').click();
  // await page.getByTestId('select-component').selectOption({ label: 'Delete me' });
  // await page.getByRole('button', { name: 'Delete map' }).click()

  // await expect(page.locator('.loader')).toHaveCount(0)

  // const finalCount = await page.locator('app-card').count()
  // expect(initialCount).toEqual(finalCount)
});