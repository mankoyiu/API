import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import { authRouter } from './routes/auth';
import { hotelsRouter } from './routes/hotels';

const app = new Koa();

// Middleware
app.use(bodyParser());
app.use(logger());
app.use(json());

// Routes
const router = new Router();
router.use('/auth', authRouter.routes());
router.use('/hotels', hotelsRouter.routes());
app.use(router.routes());

app.listen(10888, () => {
    console.log('WonderLust API started');
});