export async function generateAIContent(prompt: string, systemInstruction?: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('AI Service Error details:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - check if server is running and accessible at /api/ai/generate');
    }
    throw error;
  }
}
