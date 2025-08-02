
export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log("Webhook received:", req.body);
    return res.status(200).json({ received: true, data: req.body });
  }
  res.status(405).end();
}
