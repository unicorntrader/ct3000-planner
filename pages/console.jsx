import React, { useEffect, useState } from "react";

export default function Console() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/webhook-messages");
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Webhook Console</h1>
      {messages.length === 0 ? (
        <p>No webhook messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div><strong>Time:</strong> {new Date(msg.time).toLocaleString()}</div>
            <pre>{JSON.stringify(msg.payload, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  );
}
