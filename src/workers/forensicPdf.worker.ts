// Dummy worker to satisfy Vite build
self.onmessage = (event) => {
    // Return a dummy error for now to prevent hanging
    self.postMessage({ type: 'error', error: 'PDF Worker is offline/dummy' });
};
