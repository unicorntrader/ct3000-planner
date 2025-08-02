let messages = [];

export function addMessage(msg) {
  messages.unshift({
    id: Date.now(),
    time: new Date().toISOString(),
    payload: msg,
  });
  if (messages.length > 50) messages = messages.slice(0, 50);
}

export function getMessages() {
  return messages;
}
