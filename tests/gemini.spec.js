import { test, expect } from '@playwright/test';

test.describe('Gemini Service Tests (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the Gemini API before navigating
        await page.route('**/generativelanguage.googleapis.com/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    candidates: [{
                        content: {
                            parts: [{
                                text: 'This is a mocked Gemini response for testing purposes.'
                            }]
                        }
                    }]
                })
            });
        });

        // Clear localStorage and navigate
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Wait for app to initialize
        await page.waitForFunction(() => {
            const indicator = document.getElementById('service-indicator');
            return indicator && indicator.textContent.includes('Eliza');
        }, { timeout: 5000 });
    });

    test('should open settings and switch to Gemini', async ({ page }) => {
        // Open settings
        await page.locator('#settings-btn').click();

        // Wait for modal
        await page.waitForTimeout(200);

        // Verify settings modal appears
        const modal = page.locator('.settings-modal');
        await expect(modal).toBeVisible();

        // Switch to Gemini
        await page.locator('#service-select').selectOption('gemini');

        // Enter a fake API key
        await page.locator('#api-key-input').fill('test-api-key-12345');

        // Save settings
        await page.locator('#save-settings-btn').click();

        // Wait for modal to close
        await page.waitForTimeout(300);

        // Verify service indicator updated
        await expect(page.locator('#service-indicator')).toContainText('Gemini');
    });

    test('should send message with Gemini (mocked)', async ({ page }) => {
        // Switch to Gemini first
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);
        await page.locator('#service-select').selectOption('gemini');
        await page.locator('#api-key-input').fill('test-api-key-12345');
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);

        // Send a message
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        await messageInput.fill('Hello Gemini');
        await sendButton.click();

        // Wait for response
        await page.waitForTimeout(1000);

        // Verify mocked response appears
        const botMessage = page.locator('.message.bot .message-bubble').first();
        await expect(botMessage).toContainText('mocked Gemini response');
    });

    test('should handle API errors gracefully', async ({ page }) => {
        // Override mock with error
        await page.route('**/generativelanguage.googleapis.com/**', async route => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: {
                        message: 'Invalid API key'
                    }
                })
            });
        });

        // Switch to Gemini
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);
        await page.locator('#service-select').selectOption('gemini');
        await page.locator('#api-key-input').fill('invalid-key');
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);

        // Send a message
        await page.locator('#message-input').fill('Test error');
        await page.locator('#chat-form button[type="submit"]').click();

        // Wait for error message
        await page.waitForTimeout(1000);

        // Should show error in chat
        const errorMessage = page.locator('.message.bot .message-bubble').first();
        await expect(errorMessage).toContainText('error');
    });

    test('should persist service selection', async ({ page }) => {
        // Switch to Gemini
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);
        await page.locator('#service-select').selectOption('gemini');
        await page.locator('#api-key-input').fill('test-key-persist');
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Verify Gemini is still selected
        await expect(page.locator('#service-indicator')).toContainText('Gemini');
    });

    test('should require API key for Gemini', async ({ page }) => {
        // Open settings
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);

        // Switch to Gemini without entering key
        await page.locator('#service-select').selectOption('gemini');

        // Clear the API key field
        await page.locator('#api-key-input').clear();

        // Set up dialog handler
        let alertShown = false;
        page.once('dialog', dialog => {
            alertShown = true;
            expect(dialog.message()).toContain('API key');
            dialog.accept();
        });

        // Try to save
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);

        // Verify alert was shown
        expect(alertShown).toBe(true);
    });

    test('should switch between Eliza and Gemini', async ({ page }) => {
        // Start with Eliza
        await expect(page.locator('#service-indicator')).toContainText('Eliza');

        // Switch to Gemini
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);
        await page.locator('#service-select').selectOption('gemini');
        await page.locator('#api-key-input').fill('test-key');
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);
        await expect(page.locator('#service-indicator')).toContainText('Gemini');

        // Switch back to Eliza
        await page.locator('#settings-btn').click();
        await page.waitForTimeout(200);
        await page.locator('#service-select').selectOption('eliza');
        await page.locator('#save-settings-btn').click();
        await page.waitForTimeout(300);
        await expect(page.locator('#service-indicator')).toContainText('Eliza');
    });
});