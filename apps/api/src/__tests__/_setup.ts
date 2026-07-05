/**
 * Set required env vars before any module that reads them is imported.
 * Must run before env.ts / jwt.ts / etc. are loaded.
 */
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/pcmp_test';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-16-chars';
process.env.JWT_EXPIRES_IN = '7d';
process.env.API_BASE_URL = 'http://localhost:5000';
process.env.CLIENT_BASE_URL = 'http://localhost:5173';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/api/auth/google/callback';
process.env.LOG_LEVEL = 'fatal'; // silence logs during tests
