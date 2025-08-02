// pages/api/webhook.js

import { saveMessage } from './_store';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid body' });
    }

    saveMessage({
      ...body,
      receivedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
