import { config } from 'dotenv'
config({ path : ".env"}); // Load environment variables
import app from './src/app.js';


const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
