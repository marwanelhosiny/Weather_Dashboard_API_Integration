import axios from 'axios';
import cache from '../utils/cache.js';
import { config } from '../config.js';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const API_KEY = config.apiKey; // API key from configuration

/**
 * Get geographical coordinates from the city name
 * @param {string} city - City name
 */
export const getCoordinates = async (city) => {
    try {
        const response = await axios.get(GEOCODING_API_URL, {
            params: {
                q: city,
                limit: 1,
                appid: API_KEY,
            },
        });

        if (response.data.length === 0) {
            const error = new Error(`City "${city}" not found.`);
            error.cause = 404;
            throw error;
        }

        const { lat, lon } = response.data[0];
        return { lat, lon };
    } catch (error) {
        console.error(`Error fetching coordinates for "${city}":`, error.message);
        throw error;
    }
};

/**
 * Get current weather by city
 */
export const getCurrentWeather = async (req, res) => {
    const { city } = req.params;
    const cacheKey = `weather:current:${city.toLowerCase()}`;

    try {
        // Check cache
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ source: 'cache', data: cachedData });
        }

        // Fetch data from API
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
            },
        });

        const data = {
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
        };

        // Cache the result for 1 hour
        await cache.set(cacheKey, data, 3600);

        return res.status(200).json({ source: 'API', data });
    } catch (error) {
        handleWeatherApiError(res, error);
    }
};

/**
 * Get 5-day weather forecast by city
 */
export const getForecast = async (req, res) => {
    const { city } = req.params;
    const cacheKey = `weather:forecast:${city.toLowerCase()}`;

    try {
        // Check cache
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ source: 'cache', data: cachedData });
        }

        // Get coordinates
        const { lat, lon } = await getCoordinates(city);

        // Fetch forecast data
        const response = await axios.get(FORECAST_API_URL, {
            params: {
                lat,
                lon,
                appid: API_KEY,
                units: 'metric',
            },
        });

        const forecastData = response.data.list.map((item) => ({
            date: item.dt_txt.split(' ')[0],
            temperature: item.main.temp,
            description: item.weather[0].description,
        }));

        // Cache the result for 1 hour
        await cache.set(cacheKey, forecastData, 3600);

        return res.status(200).json({ source: 'API', data: forecastData });
    } catch (error) {
        handleWeatherApiError(res, error);
    }
};

/**
 * Handle errors for weather API requests
 * @param {Object} res - Response object
 * @param {Error} error - Error object
 */
const handleWeatherApiError = (res, error) => {
    console.error("Weather API Error:", error.message);
    const statusCode = error.cause || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
    });
};
