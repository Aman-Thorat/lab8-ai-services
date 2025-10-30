// Had a tough time configuring so used ChatGPT for help on both tests

import { test, expect } from '@playwright/test';

test.describe('Eliza Service Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
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

    test('should load the chat application', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('AI Chat');
        await expect(page.locator('#service-indicator')).toContainText('Eliza');
    });

    test('should send a message and get Eliza response', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        // Send a greeting
        await messageInput.fill('Hello');
        await sendButton.click();

        // Wait for user message to appear
        await expect(page.locator('.message.user')).toBeVisible({ timeout: 2000 });

        // Wait for bot response (Eliza responds quickly)
        await expect(page.locator('.message.bot')).toBeVisible({ timeout: 3000 });

        // Check that bot message contains text
        const botMessage = page.locator('.message.bot .message-bubble').first();
        await expect(botMessage).not.toBeEmpty();
    });

    test('should handle multiple messages', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        const messages = ['Hi', 'How are you'];

        for (const msg of messages) {
            await messageInput.fill(msg);
            await sendButton.click();
            // Wait for bot response before sending next
            await page.waitForTimeout(500);
        }

        // Should have 4 messages total (2 user + 2 bot)
        await page.waitForTimeout(500);
        const allMessages = page.locator('.message:not(.typing-indicator)');
        await expect(allMessages).toHaveCount(4);
    });

    test('should update message count', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');
        const messageCount = page.locator('#message-count');

        await messageInput.fill('Test message');
        await sendButton.click();

        // Wait for both user and bot messages
        await page.waitForTimeout(800);

        // Should show 2 messages
        await expect(messageCount).toContainText('2 message');
    });

    test('should allow editing user messages', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        // Send a message
        await messageInput.fill('Original message');
        await sendButton.click();

        // Wait for message to appear
        await page.waitForTimeout(800);

        // Click edit button
        const editButton = page.locator('.message.user .btn-small.edit').first();
        await editButton.click();

        // Edit the message
        const editInput = page.locator('.edit-form input');
        await editInput.clear();
        await editInput.fill('Edited message');
        await page.locator('.edit-form .save').click();

        // Verify the edit
        await expect(page.locator('.message.user .message-bubble').first()).toContainText('Edited message');
        await expect(page.locator('.edited-indicator').first()).toBeVisible();
    });

    test('should delete messages', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        // Send a message
        await messageInput.fill('Delete me');
        await sendButton.click();

        await page.waitForTimeout(800);

        // Set up dialog handler before clicking
        page.once('dialog', dialog => dialog.accept());

        const deleteButton = page.locator('.message.user .btn-small.delete').first();
        await deleteButton.click();

        // Wait a bit for deletion
        await page.waitForTimeout(300);

        // Verify user message was deleted (bot message should still be there)
        await expect(page.locator('.message.user')).toHaveCount(0);
    });

    test('should export chat history', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        // Send a message
        await messageInput.fill('Export test');
        await sendButton.click();
        await page.waitForTimeout(800);

        // Click export button
        const downloadPromise = page.waitForEvent('download');
        await page.locator('#export-btn').click();
        const download = await downloadPromise;

        // Verify download
        expect(download.suggestedFilename()).toContain('chat-export');
        expect(download.suggestedFilename()).toContain('.json');
    });

    test('should persist messages on reload', async ({ page }) => {
        const messageInput = page.locator('#message-input');
        const sendButton = page.locator('#chat-form button[type="submit"]');

        // Send a message
        await messageInput.fill('Persist test');
        await sendButton.click();
        await page.waitForTimeout(800);

        // Get message count before reload
        const messagesBefore = await page.locator('.message:not(.typing-indicator)').count();

        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Wait for app to reinitialize
        await page.waitForTimeout(500);

        // Verify messages still exist
        const messagesAfter = await page.locator('.message:not(.typing-indicator)').count();
        expect(messagesAfter).toBe(messagesBefore);
    });
});