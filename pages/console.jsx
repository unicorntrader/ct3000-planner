
import React from 'react';

export default function Console() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Webhook Console</h1>
      <p>This page will show incoming webhook POSTs to /api/webhook. Check your Vercel logs to see payloads for now.</p>
    </div>
  );
}
