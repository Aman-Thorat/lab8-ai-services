const testBtn = document.getElementById('testBtn');
const responseDiv = document.getElementById('response');
const apiKeyInput = document.getElementById('apiKey');
const messageInput = document.getElementById('message');

testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const message = messageInput.value.trim();

    if (!apiKey) {
        showResponse('Please enter your API key', true);
        return;
    }

    if (!message) {
        showResponse('Please enter a test message', true);
        return;
    }

    await testOpenAI(apiKey, message);
});

async function testOpenAI(apiKey, message) {
    showResponse('Sending request to OpenAI...', false, true);
    testBtn.disabled = true;

    const startTime = Date.now();

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: message }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();
        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }

        const aiResponse = data.choices[0].message.content;

        showResponse(`
            <h3>✅ Success!</h3>
            <p><strong>Response time:</strong> ${elapsed}ms</p>
            <p><strong>Model:</strong> ${data.model}</p>
            <p><strong>AI Response:</strong></p>
            <p>${aiResponse}</p>
            <details>
                <summary>View Full JSON Response</summary>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </details>
        `);

    } catch (error) {
        showResponse(`
            <h3>❌ Error</h3>
            <p>${error.message}</p>
            <p><small>Common issues: Invalid API key, no credits remaining, or rate limit exceeded.</small></p>
        `, true);
    } finally {
        testBtn.disabled = false;
    }
}

function showResponse(content, isError = false, isLoading = false) {
    responseDiv.innerHTML = content;
    responseDiv.className = 'response';
    if (isError) responseDiv.classList.add('error');
    if (isLoading) responseDiv.classList.add('loading');
    responseDiv.style.display = 'block';
}