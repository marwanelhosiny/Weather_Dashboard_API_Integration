import { createClient } from 'redis';

// Create Redis client
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Error handling
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Connect to Redis
(async () => {
    try {
        await client.connect();
        
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();

// Cache utility methods
const cache = {
    get: async (key) => {
        try {
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Cache get error:', err);
            return null;
        }
    },
    set: async (key, value, expiry = 3600) => {
        try {
            await client.set(key, JSON.stringify(value), { EX: expiry });
        } catch (err) {
            console.error('Cache set error:', err);
        }
    },
    delete: async (key) => {
        try {
            await client.del(key);
        } catch (err) {
            console.error('Cache delete error:', err);
        }
    }
};

export default cache;