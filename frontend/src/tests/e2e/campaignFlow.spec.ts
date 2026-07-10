import { test, expect } from '@playwright/test';

test.describe('StellarFlow AI — End-to-End User Journeys', () => {
  test('should load landing page and navigate to dashboard', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Check that title or heading matches
    await expect(page).toHaveTitle(/StellarFlow AI/i);
    
    // Check CTA button
    const exploreBtn = page.getByRole('button', { name: /Explore Campaigns/i });
    await expect(exploreBtn).toBeVisible();
    
    // Click button to go to campaign board
    await exploreBtn.click();
    
    // Check that we navigated to the campaigns page
    await expect(page).toHaveURL(/\/campaigns/);
  });
});
