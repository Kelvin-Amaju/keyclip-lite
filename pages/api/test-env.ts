// /pages/api/test-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'Not set',
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  });
}