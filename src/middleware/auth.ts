import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';
import { User, IUser } from '../models/User';

// Extend the default state to include user
declare module 'koa' {
    interface DefaultState {
        user: IUser;
    }
}

export const operatorAuth = async (ctx: Context, next: Next) => {
    try {
        const token = ctx.headers.authorization?.split(' ')[1];
        if (!token) {
            ctx.status = 401;
            ctx.body = { message: 'Authentication required' };
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'operator') {
            ctx.status = 403;
            ctx.body = { message: 'Operator access required' };
            return;
        }

        ctx.state.user = user;
        await next();
    } catch (err) {
        ctx.status = 401;
        ctx.body = { message: 'Invalid token' };
    }
};