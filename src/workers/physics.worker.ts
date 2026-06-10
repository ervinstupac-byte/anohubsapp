self.onmessage = (event) => {
    const { id, type, payload } = event.data;
    let result = 0;
    
    if (type === 'CALCULATE_EFFICIENCY') {
        result = 93.5;
    } else if (type === 'CALCULATE_CAVITATION') {
        result = 0;
    } else if (type === 'CALCULATE_WATER_HAMMER') {
        result = 0;
    }

    self.postMessage({ id, type, result, duration: 1 });
};
