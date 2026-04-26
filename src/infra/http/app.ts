import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import v1Router from './routes/v1/routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', v1Router);

export default app;