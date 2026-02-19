export const createHash = (algorithm: string) => {
    return new Hash();
};

class Hash {
    private content: string = '';

    update(data: string): this {
        this.content += data;
        return this;
    }

    digest(encoding: string): string {
        // Simple non-secure hash for demo purposes (Simulation Mode)
        // Returns a 64-character hex string (mimicking SHA-256)
        let hash = 0;
        if (this.content.length === 0) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // Empty SHA-256

        for (let i = 0; i < this.content.length; i++) {
            const char = this.content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Make it look like a SHA-256 hash by repeating/transforming
        const base = Math.abs(hash).toString(16).padStart(8, '0');
        // Generate a pseudo-random looking string based on the input hash
        let result = '';
        let current = hash;
        for(let i=0; i<8; i++) {
             current = ((current << 5) - current) + (i * 7);
             result += Math.abs(current).toString(16).padStart(8, '0');
        }
        
        return result.substring(0, 64);
    }
}

export default { createHash };
