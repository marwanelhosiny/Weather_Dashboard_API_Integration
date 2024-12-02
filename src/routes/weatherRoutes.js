import express from 'express';
import expressAsyncHandler from 'express-async-handler';


import * as ws from '../services/weatherService.js';

const router = express.Router();

// Endpoint: Get current weather by city
router.get('/current/:city',expressAsyncHandler(ws.getCurrentWeather));

// Endpoint: Get 5-day weather forecast by city
router.get('/forecast/:city',expressAsyncHandler(ws.getForecast));

export default router;
