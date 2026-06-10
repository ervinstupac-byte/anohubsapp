// Dummy worker for EventJournal to satisfy Vite build
self.onmessage = (event) => {
    const data = event.data;
    if (data && data.action === 'fetchOlderEvents') {
        // Return streamComplete immediately
        self.postMessage({ action: 'streamComplete', count: 0 });
    }
};
