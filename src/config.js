
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    apiKey: process.env.OPENWEATHERMAP_API_KEY,
};
