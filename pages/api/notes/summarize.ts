// /pages/api/notes/summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables' });
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Summarize the following content in 4-5 sentences, providing key details and main ideas:\n\n${content}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    console.log('Summary API response:', summary);
    res.status(200).json({ summary });
  } catch (err: any) {
    console.error('Gemini API error:', {
      message: err.message,
      status: err.response?.status,
    });
    res.status(500).json({ error: 'Failed to generate summary', details: err.message });
  }
}



// Prompts tp get different results and outcomes
/*
1. const prompt = `Summarize the following content in 4-5 sentences, providing key details and main ideas:\n\n${content}`;
2. const prompt = `Provide a slightly longer summary of the following content, around 50-75 words, highlighting the most important aspects:\n\n${content}`;
3. const prompt = `Generate a more detailed summary of the following content, going slightly beyond a brief overview to include supporting information where relevant:\n\n${content}`;
4. const prompt = `Summarize the following content in approximately 3-5 sentences, ensuring you capture the core message and any significant supporting points:\n\n${content}`;
*/