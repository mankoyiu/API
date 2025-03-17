import Koa from 'koa';
import Router from '@koa/router';
//import Router, { RouterContext } from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth';
import { hotelsRouter } from './routes/hotels';



import { connectDB } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
connectDB();







const app = new Koa();
export default app; 

// Database
mongoose.connect(process.env.MONGODB_URI!);
mongoose.connection.on('error', console.error);

// Middleware
app.use(bodyParser());


// Routes
const router = new Router();
router.use('/auth', authRouter.routes());
router.use('/hotels', hotelsRouter.routes());
app.use(router.routes());



app.listen(10888, () => {
    console.log('WonderLust API started');
}); 