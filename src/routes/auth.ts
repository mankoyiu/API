import Router from '@koa/router';
import { Context } from 'koa';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = new Router({
    prefix: '/api/auth'
});

// Define an interface for the request body
interface RegisterRequestBody {
    email: string;
    password: string;
    name: string;
    role?: string;
}

router.post('/register', async (ctx: Context) => {
    try {
        // Type assertion for request body
        const { email, password, name, role }: RegisterRequestBody = ctx.request.body as RegisterRequestBody;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            ctx.status = 400;
            ctx.body = { message: 'User already exists' };
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            role: role || 'user'
        });

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        ctx.status = 201;
        ctx.body = {
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { message: 'Error creating user' };
    }
});

export const authRouter = router;