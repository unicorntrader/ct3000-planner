// pages/api/_store.js

let messages = [];

export function saveMessage(msg) {
  messages.unshift(msg); // Add to front
  if (messages.length > 50) messages = messages.slice(0, 50); // Cap at 50
}

export function getMessages() {
  return messages;
}
