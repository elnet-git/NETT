type Handler = (data: any) => void;

const events: Record<string, Handler[]> = {};

export const emit = (event: string, data: any) => {
  console.log("EVENT:", event, data);

  (events[event] || []).forEach((fn) => fn(data));
};

export const on = (event: string, handler: Handler) => {
  if (!events[event]) {
    events[event] = [];
  }

  events[event].push(handler);
};