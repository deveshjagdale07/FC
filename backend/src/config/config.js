require('dotenv').config();

module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/farmer_marketplace',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key_here',
    expiry: process.env.JWT_EXPIRE || '7d',
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
};
