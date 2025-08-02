import { addMessage } from "../../lib/webhookStore";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;
    addMessage(body);
    res.status(200).json({ status: "received", time: new Date().toISOString() });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
