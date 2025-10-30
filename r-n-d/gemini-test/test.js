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

    await testGeminiAPI(apiKey, message);
});

async function testGeminiAPI(apiKey, message) {
    showResponse('Sending request to Gemini...', false, true);
    testBtn.disabled = true;

    const startTime = Date.now();

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: message }]
                    }]
                })
            }
        );

        const data = await response.json();
        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        showResponse(`
            <h3>✅ Success!</h3>
            <p><strong>Response time:</strong> ${elapsed}ms</p>
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
            <p><small>Make sure your API key is valid and you have enabled the Gemini API.</small></p>
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