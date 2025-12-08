type EventCallback = (data: any) => void;
const events: Record<string, EventCallback[]> = {};

export const on = (event: string, callback: EventCallback) => {
  if (!events[event]) events[event] = [];
  events[event].push(callback);
};

export const off = (event: string, callback: EventCallback) => {
  if (!events[event]) return;
  events[event] = events[event].filter(cb => cb !== callback);
};

export const emit = (event: string, data?: any) => {
  if (!events[event]) return;
  events[event].forEach(cb => cb(data));
};

export const EVENTS = {
  TRIGGER_FAKE_CALL: 'TRIGGER_FAKE_CALL'
};