const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, /\.vercel\.app$/] : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
// MongoDB Connection
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

console.log('Attempting to connect to MongoDB...');
// Debug: Log the URI (masked)
if (process.env.MONGODB_URI) {
  const maskedURI = process.env.MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
  console.log(`Connection parameter: ${maskedURI}`);
} else {
  console.error('FATAL: MONGODB_URI is not defined');
}

mongoose.connect(process.env.MONGODB_URI, clientOptions)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error details:', err);
    // Print verify hint
    console.error('HINT: Check if your IP is whitelisted in Atlas (0.0.0.0/0) and if the user/password in Render Environment Variables are correct.');
  });

// Routes
// Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const templateRoutes = require('./routes/templateRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Rental Management System API is running');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
