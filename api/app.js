

require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use((req, res, next) => {
  console.log('📡 Incoming:', req.method, req.url);
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', require('./routes/index'));

app.get('/health', (req, res) => res.send('ok'));

// 404
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use(function (err, req, res, next) {
  const isDev = req.app.get('env') === 'development';
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || 'Internal Server Error',
    stack: isDev ? err.stack : undefined
  });
});

module.exports = app;
