import React, { useEffect, useState } from 'react';

export default function Console() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Webhook Console</h1>
      <div style={{ marginTop: "1rem", padding: "1rem", background: "#f4f4f4", borderRadius: "4px" }}>
        {logs.length === 0 ? (
          <p>No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <pre key={index} style={{ marginBottom: "1rem", background: "#fff", padding: "1rem", border: "1px solid #ddd" }}>
              {JSON.stringify(log, null, 2)}
            </pre>
          ))
        )}
      </div>
    </div>
  );
}
