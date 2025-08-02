import { getMessages } from "../../lib/webhookStore";

export default function handler(req, res) {
  res.status(200).json(getMessages());
}
