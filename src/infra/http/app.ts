import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import v1Router from './routes/v1/routes.js';
import '../../shared/config/env'
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', v1Router);


app.use(errorHandler)

export default app;
