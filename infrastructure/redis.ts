const store = new Map<string, any>();

export const redis = {
  set: async (key: string, value: any) => {
    store.set(key, value);
  },

  get: async (key: string) => {
    return store.get(key);
  },

  del: async (key: string) => {
    store.delete(key);
  },
};