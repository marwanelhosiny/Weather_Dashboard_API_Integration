import { createClient } from 'redis';

// Get the Redis URL from environment variables for better security and flexibility
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // Default to localhost if not provided

// Create and connect the Redis client
const client = createClient({
    url: redisUrl,  // Add the Redis URL (this can be a local or remote Redis instance)
});

(async () => {
    try {
        await client.connect();
        console.log('Successfully connected to Redis!');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

// Cache methods
const cache = {
    get: async (key) => {
        try {
            const data = await client.get(key);
            return data ? JSON.parse(data) : null; // Return parsed data if it exists, otherwise null
        } catch (err) {
            console.error('Cache get error:', err);
            return null; // Return null on error
        }
    },

    set: async (key, value, expiry = 3600) => {
        try {
            await client.set(key, JSON.stringify(value), { EX: expiry }); // Store JSON string with expiry
        } catch (err) {
            console.error('Cache set error:', err);
        }
    },

    delete: async (key) => {
        try {
            await client.del(key); // Delete the key from Redis
        } catch (err) {
            console.error('Cache delete error:', err);
        }
    },

    // Ensure graceful shutdown of the Redis client
    disconnect: async () => {
        try {
            await client.quit(); // Close Redis connection
        } catch (err) {
            console.error('Error during Redis disconnection:', err);
        }
    },
};

export default cache;
