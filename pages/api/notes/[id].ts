// /pages/api/notes/[id].ts
import dbConnect from '@/lib/db';
import Note from '@/models/Notes';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updated = await Note.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ error: 'Failed to update note' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Note.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ error: 'Failed to delete note' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}