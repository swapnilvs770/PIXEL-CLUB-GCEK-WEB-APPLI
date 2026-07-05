import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const mongoState = mongoose.connection.readyState; // 1 = connected
    sendOk(res, {
      status: 'ok',
      service: 'pcmp-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongo: mongoState === 1 ? 'connected' : 'disconnected',
    });
  })
);

export default router;
