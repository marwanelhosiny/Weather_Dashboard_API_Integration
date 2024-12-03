import { jest } from '@jest/globals';
import axios from 'axios';
import cache from '../utils/cache.js';
import * as weatherService from '../services/weatherService.js';

jest.mock('redis', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(true),
        quit: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    }),
}));

jest.mock('axios');
jest.mock('../utils/cache.js');


describe('Weather Service', () => {

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });  // Suppress console errors during tests
    });

    afterEach(() => {
        console.error.mockRestore();  // Restore original console.error after tests
        jest.clearAllMocks();

    });

    test('getCoordinates should return correct coordinates for a city', async () => {
        const mockResponse = {
            data: [
                { lat: 51.5074, lon: -0.1278 }
            ],
        };
        axios.get.mockResolvedValue(mockResponse);

        const city = 'London';
        const result = await weatherService.getCoordinates(city);

        expect(result).toEqual({ lat: 51.5074, lon: -0.1278 });
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('direct'), {
            params: { q: city, limit: 1, appid: expect.any(String) },
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
        const mockWeatherData = {
            name: 'London',
            main: { temp: 18 },
            weather: [{ description: 'clear sky' }],
            wind: { speed: 3.5 },
        };
        cache.get.mockResolvedValue(null);
        axios.get.mockResolvedValue({ data: mockWeatherData });

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(cache.set).toHaveBeenCalledWith(
            `weather:current:london`,
            {
                city: 'London',
                temperature: 18,
                description: 'clear sky',
                humidity: undefined,
                windSpeed: 3.5,
            },
            3600
        );
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('weather'), {
            params: { q: 'London', appid: expect.any(String), units: 'metric' },
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            source: 'API',
            data: {
                city: 'London',
                temperature: 18,
                description: 'clear sky',
                humidity: undefined,
                windSpeed: 3.5,
            },
        });
    });

    test('getCurrentWeather should use cache if available', async () => {
        const mockCacheData = {
            city: 'London',
            temperature: 18,
            description: 'clear sky',
            humidity: 80,
            windSpeed: 3.5,
        };
        cache.get.mockResolvedValue(mockCacheData);

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await weatherService.getCurrentWeather(mockReq, mockRes);

        expect(axios.get).not.toHaveBeenCalled(); // Ensure no API call is made
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            source: 'cache', // Corrected casing
            data: mockCacheData,
        });
    });

    test('getCoordinates should handle API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('API error')); // Simulate API error

        const city = 'London';
        await expect(weatherService.getCoordinates(city)).rejects.toThrow(
            'API error' // Adjusted to match the actual error message
        );
    });

    test('getForecast should return cached data if available', async () => {
        const mockCachedData = [
            { date: '2024-12-03', temperature: 20, description: 'clear sky' },
        ];
        cache.get.mockResolvedValue(mockCachedData);

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await weatherService.getForecast(mockReq, mockRes);

        expect(cache.get).toHaveBeenCalledWith('weather:forecast:london');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            source: 'cache',
            data: mockCachedData,
        });
        expect(axios.get).not.toHaveBeenCalled();
    });
    

    test('getForecast should handle API errors gracefully', async () => {
        cache.get.mockResolvedValue(null);
        axios.get.mockRejectedValue(new Error('API error'));

        const mockReq = { params: { city: 'London' } };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await weatherService.getForecast(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'API error',
        });
    });
});
