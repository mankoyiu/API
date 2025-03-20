import { Context } from "koa";
import { users } from "../models/users";
import { validationResults } from 'koa-req-validation';
export const basicAuthMiddleWare = async (ctx: Context, next: any) => {
 const authHeader = ctx.request.headers.authorization;
 if (!authHeader || !authHeader.startsWith('Basic ')) {
    ctx.status = 401;
    ctx.headers['WWW-Authenticate'] = 'Basic realm="Secure Area"';
    ctx.body = { msg: 'Authorization required' };
    } else {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [username, password] = auth.split(':');
    console.log(`${username} is trying to access`);
    if (validationCredentials(username, password)) {
    ctx.state.user = { username };
    } else {
    ctx.status = 401;
    ctx.body = { msg: 'Authorization failed' };
    }
    }
    await next();
   }
   const validationCredentials = (username: string, password: string):boolean => {
    let result = false;
    users.forEach((user) => {
    if (user.username === username && user.password === password) {
    result = true;
    }
    });
    return result;
   }