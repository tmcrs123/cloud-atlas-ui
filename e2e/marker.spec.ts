import { test, expect } from '@playwright/test';

test('adds a marker', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByText('START YOUR JOURNEY').click();
  await page.getByRole('button', { name: 'Manage maps' }).click();
  await page.getByText('Add Map').click();
  await page.getByTestId('add-atlas-input').click();
  await page.getByTestId('add-atlas-input').fill('delete me');
  await page.getByRole('button', { name: 'Add map' }).click();
  await page.getByRole('heading', { name: 'delete me' }).click();
  await page.getByRole('button', { name: 'Manage markers' }).click();
  await page.getByText('Add marker').click();
  await page.getByRole('textbox', { name: 'search...' }).click();
  await page.getByRole('textbox', { name: 'search...' }).fill('london');
  await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.$/ }).nth(1).click();
  await page.getByRole('textbox', { name: 'The name of your new marker' }).click();
  await page.getByRole('textbox', { name: 'The name of your new marker' }).fill('london eye');
  await page.getByRole('button', { name: 'Add marker' }).click();
  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page.getByRole('heading', { name: 'london eye' })).toBeVisible();
});

// test('deletes a marker', async ({ page }) => {
//   await page.goto('http://localhost:4200/');
//   await page.getByText('Log in').first().click();
//   await page.getByRole('heading', { name: 'delete me' }).click();
//   await page.getByRole('button', { name: 'Manage markers' }).click();
//   await page.getByText('Delete marker').click();
//   await page.getByTestId('select-component').selectOption({ label: 'Delete me' });
//   await page.getByRole('button', { name: 'Delete marker' }).click();
//   await expect(page.getByText('¯\\_(ツ)_/¯You do not have any')).toBeVisible();

//   await page.locator('#breadcrumbs').getByRole('link', { name: 'Your maps' }).click();
//   await page.getByRole('button', { name: 'Manage maps' }).click();
//   await page.getByText('Delete Map').click();
//   await page.getByTestId('select-component').selectOption({ label: 'Delete me' });
//   await page.getByRole('button', { name: 'Delete map' }).click();
// })