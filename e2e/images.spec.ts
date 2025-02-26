import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // await page.goto('http://localhost:4200/');
  // await page.getByText('START YOUR JOURNEY').click();
  // await page.getByRole('button', { name: 'Manage maps' }).click();
  // await page.getByText('Add Map').click();
  // await page.getByTestId('add-atlas-input').click();
  // await page.getByTestId('add-atlas-input').fill('delete me');
  // await page.getByRole('button', { name: 'Add map' }).click();
  // await page.getByRole('heading', { name: 'delete me' }).click();
  // await page.getByRole('button', { name: 'Manage markers' }).click();
  // await page.getByText('Add marker').click();
  // await page.getByRole('textbox', { name: 'search...' }).click();
  // await page.getByRole('textbox', { name: 'search...' }).fill('london');
  // await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.$/ }).nth(1).click();
  // await page.getByRole('textbox', { name: 'The name of your new marker' }).click();
  // await page.getByRole('textbox', { name: 'The name of your new marker' }).fill('london eye');
  // await page.getByRole('button', { name: 'Add marker' }).click();

  await page.goto('http://localhost:4200/');
  await page.getByText('START YOUR JOURNEY').click();
  await page.getByRole('heading', { name: 'delete me' }).click();
  await page.getByRole('button', { name: 'Show on map' }).click();
  await page.getByRole('heading', { name: 'london eye' }).click();
  await page.getByRole('button', { name: 'london eye' }).click();
  await page.getByRole('button', { name: 'Go to marker' }).click();
  await page.getByRole('button', { name: 'Manage journal' }).click();
  await page.getByRole('textbox', { name: 'Say something about this' }).click();
  await page.getByRole('textbox', { name: 'Say something about this' }).fill('This is bananas');
  await page.getByRole('button', { name: 'Save journal' }).click();
  await expect(page.getByRole('paragraph')).toContainText('This is bananas');
  // await page.getByRole('button', { name: 'Add new image' }).click();
  await page.locator('.file-upload-desktop').setInputFiles('cloud-atlas-ui/e2e/assets/test.png');
  await expect(page.locator('.loader')).toHaveCount(0)
  await page.waitForTimeout(2000)

  await page.locator('.file-upload-desktop').setInputFiles('cloud-atlas-ui/e2e/assets/test.png');
  await expect(page.locator('.loader')).toHaveCount(0)
  await page.waitForTimeout(2000)


  const count = await page.locator('app-dropdown').getByRole('button').count()

  expect(count).toBe(2)

});