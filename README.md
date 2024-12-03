# Weather Dashboard API Integration

This project integrates with a weather API to fetch weather data, including current weather and forecasts, and cache the results for better performance. It includes robust error handling, caching logic, and unit tests using Jest.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
- [Testing](#testing)


## Project Description

The **Weather Dashboard API Integration** project provides weather-related data (current weather and forecasts) for any city. It uses an external weather API to fetch data, and implements caching mechanisms using Redis to minimize API calls for repeated requests.

The service consists of several endpoints that retrieve weather data, using a combination of coordinates, weather data, and forecast details. The project is built to be scalable and can be easily extended for additional features or APIs.

## Features

- **Current Weather**: Fetches current weather data for a given city (including temperature, humidity, and description).
- **Weather Forecast**: Provides a forecast for a city (daily temperatures and weather descriptions).
- **Caching**: Uses Redis to cache weather data to avoid repeated API calls within a time window.
- **Error Handling**: Gracefully handles any errors during API calls, including timeouts or invalid city names.
- **Unit Testing**: Uses Jest for unit testing to ensure all functionality works as expected.

## Technologies

- **Node.js**: JavaScript runtime for building the API.
- **Express.js**: Web framework for building the server and handling HTTP requests.
- **Axios**: Promise-based HTTP client for making requests to external APIs.
- **Redis**: In-memory data store used for caching weather data.
- **Jest**: Testing framework to ensure the API logic is functioning correctly.
- **Weather API**: External API used for fetching weather data (OpenWeatherMap API).

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/weather-dashboard-api-integration.git
   cd weather-dashboard-api-integration

2. **Install Dependencies**:
    npm install

## Setup And Configration

1. **Install Redis**:

    or use redis Docker image

2. **Set up Environment Variables**:
    as in .env.example
   
    SERVER_HOST=127.0.0.1
    SERVER_PORT=3000
    
    REDIS_URL=redis://localhost:6379
    
    NODE_ENV=development
    
    OPENWEATHERMAP_API_KEY=


## Usage
## API Endpoints

GET http://localhost:3000/current/city
GET http://localhost:3000/forecast/city

## Example Reuest And Response
1. **Endpoint gets the current weather in a specific city**:

http://localhost:3000/api/weather/current/cairo

Response:
{
"source": "API",
"data": {
"city": "Cairo",
"temperature": 22.42,
"description": "scattered clouds",
"humidity": 30,
"windSpeed": 4.12
}
}

if the requested city repeated in an hour the response is cached

{
"source": "cache",
"data": {
"city": "Cairo",
"temperature": 22.42,
"description": "scattered clouds",
"humidity": 30,
"windSpeed": 4.12
}
}

2. **Endpoint gets the weather for the upcomming 5 days with average temperature for each in specefic city**:

http://localhost:3000/api/weather/forecast/cairo

Response:

{
"source": "API",
"data": [
{
"date": "2024-12-03",
"temperature": 20.63,
"description": "scattered clouds"
},
{
"date": "2024-12-04",
"temperature": 17.8,
"description": "clear sky"
},
{
"date": "2024-12-05",
"temperature": 17.71,
"description": "clear sky"
},
{
"date": "2024-12-06",
"temperature": 19.41,
"description": "overcast clouds"
},
{
"date": "2024-12-07",
"temperature": 19.72,
"description": "overcast clouds"
},
{
"date": "2024-12-08",
"temperature": 18.65,
"description": "overcast clouds"
}
]
}

if the requested city repeated in an hour the response is cached

{
"source": "cache",
"data": [
{
"date": "2024-12-03",
"temperature": 20.63,
"description": "scattered clouds"
},
{
"date": "2024-12-04",
"temperature": 17.8,
"description": "clear sky"
},
{
"date": "2024-12-05",
"temperature": 17.71,
"description": "clear sky"
},
{
"date": "2024-12-06",
"temperature": 19.41,
"description": "overcast clouds"
},
{
"date": "2024-12-07",
"temperature": 19.72,
"description": "overcast clouds"
},
{
"date": "2024-12-08",
"temperature": 18.65,
"description": "overcast clouds"
}
]
}

## Running The App

    npm start

## Testing 

    npm test

    √ getCoordinates should return correct coordinates for a city (5 ms)
    √ getCoordinates should throw error if city is not found (15 ms)
    √ getCoordinates should handle API errors gracefully (3 ms)
    √ getCurrentWeather should return weather data (1 ms)
    √ getCurrentWeather should use cache if available (2 ms)
    √ getForecast should return cached data if available (1 ms)
    √ getForecast should handle API errors gracefully (1 ms)
  





        

   
