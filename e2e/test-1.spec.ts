import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByText('START YOUR JOURNEY').click();
  await page.getByRole('heading', { name: 'delete me' }).click();
  await page.getByRole('heading', { name: 'london eye' }).click();
  await page.locator('app-dropdown').getByRole('button').click();
  await page.getByText('Delete', { exact: true }).click();
  await page.getByRole('button', { name: 'Delete image' }).click();
  await page.getByText('delete me').click();
  await page.getByRole('button', { name: 'Manage markers' }).click();
  await page.getByText('Delete marker').click();
  await page.getByTestId('select-component').selectOption('dcb62512-8a7f-4c4b-9ca0-81fc97640763');
  await page.getByRole('button', { name: 'Delete marker' }).click();
  await expect(page.getByText('¯\\_(ツ)_/¯You do not have any')).toBeVisible();
  await page.locator('#breadcrumbs').getByRole('link', { name: 'Your maps' }).click();
  await page.getByRole('button', { name: 'Manage maps' }).click();
  await page.getByText('Delete Map').click();
  await page.getByTestId('select-component').selectOption('7a034585-6cb4-4bae-b05b-c4c312e15398');
  await page.getByRole('button', { name: 'Delete map' }).click();
});