import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'dev_jwt_secret_key_financial_habit_wealth_tracker_2026_super_secure!',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};
