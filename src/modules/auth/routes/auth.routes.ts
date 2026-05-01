import { Router } from 'express';
import { RefreshTokenRepository } from '../repository/refreshToken.repository.js';
import { UserRepository } from '../../user/repository/user.repository.js';
import { AuthController } from '../controller/auth.controller.js';
import { AuthService } from '../service/auth.service.js';

const authRoutes = Router();
const refreshTokenRepository = new RefreshTokenRepository();
const userRepository = new UserRepository();
const authService = new AuthService(refreshTokenRepository, userRepository);
const authController = new AuthController(authService);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique user identifier
 *         fullName:
 *           type: string
 *           description: User full name
 *         email:
 *           type: string
 *           format: email
 *           description: Unique user email
 *       required:
 *         - id
 *         - fullName
 *         - email
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         fullName: "John Doe"
 *         email: "john@example.com"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *           description: JWT token for authentication (Bearer token)
 *         refreshToken:
 *           type: string
 *           description: Token to refresh the accessToken
 *       required:
 *         - user
 *         - accessToken
 *         - refreshToken
 *       example:
 *         user:
 *           id: "550e8400-e29b-41d4-a716-446655440000"
 *           fullName: "John Doe"
 *           email: "john@example.com"
 *         accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "Invalid email or password"
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Creates a new user account with the provided data
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique user email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Authentication password
 *             required:
 *               - fullName
 *               - email
 *               - password
 *           example:
 *             fullName: "John Doe"
 *             email: "john@example.com"
 *             password: "securePassword123!"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid data or email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email and password, returning access tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *             required:
 *               - email
 *               - password
 *           example:
 *             email: "john@example.com"
 *             password: "securePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authResponse:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Revokes the provided refreshToken, ending the session
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to be revoked
 *             required:
 *               - refreshToken
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       204:
 *         description: Logout successful (no content)
 *       400:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *             required:
 *               - refreshToken
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Access token successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authResponse:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user data
 *     description: Returns the data of the currently authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token not provided or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.get('/me', authController.me);

export default authRoutes;
