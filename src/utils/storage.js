// Storage wrapper untuk development
const storage = {
  async get(key, shared = false) {
    try {
      const data = localStorage.getItem(shared ? `shared_${key}` : key);
      return data ? { value: data } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(shared ? `shared_${key}` : key, value);
      return { key, value, shared };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      localStorage.removeItem(shared ? `shared_${key}` : key);
      return { key, deleted: true, shared };
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  },

  async list(prefix = '', shared = false) {
    try {
      const keys = Object.keys(localStorage)
        .filter(k => {
          const actualKey = shared ? k.replace('shared_', '') : k;
          return actualKey.startsWith(prefix);
        });
      return { keys };
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  }
};

// Inject to window
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;
