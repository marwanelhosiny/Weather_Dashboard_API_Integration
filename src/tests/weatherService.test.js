import { jest } from '@jest/globals';
import axios from 'axios';
import cache from '../utils/cache.js';
import * as weatherService from '../services/weatherService.js';

jest.mock('axios');
jest.mock('../utils/cache.js');

describe('Weather Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getCoordinates should return correct coordinates for a city', async () => {
        const mockResponse = {
            data: [
                { lat: 51.5074, lon: -0.1278 } // Example: London
            ],
        };
        axios.get.mockResolvedValue(mockResponse);

        const city = 'London';
        const result = await weatherService.getCoordinates(city);

        expect(result).toEqual({ lat: 51.5074, lon: -0.1278 });
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('direct'), {
            params: { q: city, limit: 1, appid: process.env.OPENWEATHERMAP_API_KEY },
        });
    });

    test('getCoordinates should throw error if city is not found', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValue(mockResponse);

        const city = 'InvalidCity';
        await expect(weatherService.getCoordinates(city)).rejects.toThrow(
            `City "${city}" not found.`
        );
    });

    test('getCurrentWeather should return weather data', async () => {
        const mockWeatherData = { temp: 18, description: 'clear sky' };
        const mockCacheData = null; // Simulate cache miss
        cache.get.mockResolvedValue(mockCacheData);
        axios.get.mockResolvedValue({ data: mockWeatherData });

        const mockReq = { params: { city: 'London' } }; // Mocking req.params
        const mockRes = {
            status: jest.fn().mockReturnThis(), // Mocking the status method
            json: jest.fn() // Mocking the json method
        };

        const result = await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(result).toEqual(mockWeatherData);
        expect(cache.set).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('weather'), {
            params: { q: 'London', appid: process.env.OPENWEATHERMAP_API_KEY },
        });
        expect(mockRes.status).toHaveBeenCalledWith(200); // Ensure the status is set
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockWeatherData }); // Ensure the response is correctly sent
    });

    test('getCurrentWeather should use cache if available', async () => {
        const mockCacheData = { temp: 18, description: 'clear sky' };
        cache.get.mockResolvedValue(mockCacheData);

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const result = await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(result).toEqual(mockCacheData);
        expect(axios.get).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200); // Ensure the status is set
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockCacheData }); // Ensure the response is correctly sent
    });

    test('getCurrentWeather should handle cache errors gracefully', async () => {
        const mockCacheError = new Error('Cache error');
        cache.get.mockRejectedValue(mockCacheError); // Simulate a cache error

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockWeatherData = { temp: 20, description: 'sunny' };
        axios.get.mockResolvedValue({ data: mockWeatherData });

        const result = await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(result).toEqual(mockWeatherData);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('weather'), {
            params: { q: 'London', appid: process.env.OPENWEATHERMAP_API_KEY },
        });
        expect(mockRes.status).toHaveBeenCalledWith(200); // Ensure status is set
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockWeatherData });
    });

    test('getCurrentWeather should handle cache errors gracefully', async () => {
        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock cache to reject with an error
        cache.get.mockRejectedValue(new Error('Cache error'));

        // Mock coordinates and weather data
        const mockCoordinates = { lat: 51.5074, lon: -0.1278 };
        const mockWeatherData = {
            name: 'London',
            main: { temp: 20 },
            weather: [{ description: 'sunny' }],
            wind: { speed: 5 },
        };

        // Mock getCoordinates and axios
        weatherService.getCoordinates = jest.fn().mockResolvedValue(mockCoordinates);
        axios.get.mockResolvedValue({ data: mockWeatherData });

        await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            source: 'API',
            data: {
                city: 'London',
                temperature: 20,
                description: 'sunny',
                humidity: undefined,
                windSpeed: 5
            }
        });
    });
});
