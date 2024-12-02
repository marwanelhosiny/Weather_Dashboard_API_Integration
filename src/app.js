import express from 'express';
import weatherRoutes from './routes/weatherRoutes.js';
import { globalResponse } from './middlewares/globalResponse.js';

const app = express();

app.use(express.json()); // Middleware to parse JSON requests
app.use('/api/weather', weatherRoutes); // Route for weather endpoints

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Weather Dashboard API is running!' });
});

app.use(globalResponse)


export default app;
