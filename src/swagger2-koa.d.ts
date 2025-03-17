// swagger2-koa.d.ts
declare module 'swagger2-koa' {
    import { Middleware } from 'koa';

    export function swaggerUi(options?: any): Middleware;
}