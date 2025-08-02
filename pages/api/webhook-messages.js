// pages/api/webhook-messages.js

import { getMessages } from './_store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getMessages());
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
