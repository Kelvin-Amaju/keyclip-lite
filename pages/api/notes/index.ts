// /pages/api/notes/index.ts
import dbConnect from '@/lib/db';
import Note from '@/models/Notes';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const notes = await Note.find().sort({ createdAt: -1 });
    return res.status(200).json(notes);
  }

  if (req.method === 'POST') {
    try {
      const { content, summary, tags } = req.body;
      const newNote = await Note.create({ content, summary, tags });
      return res.status(201).json(newNote);
    } catch (error) {
      return res.status(400).json({ error: 'Failed to create note' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}