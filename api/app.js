

require('dotenv').config();

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');



// router mount

/*;
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log('📡 Incoming:', req.method, req.url);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
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
});*/
var app=express();

app.set('views',path.join(_dirname,
    'views'));
app.set('view engine','ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(_dirname,'public')));

app.use((req,res,next)=>{
  console.log("Ben app.js'te tanımlanan bir middleware'ım");
  next();
});

app.use('/api',require('./routes/index'));

app.use(function (req,res,next){
  next(createError(404));
});

app.use(function (err,req,res,next){
  res.locals.message=err.message;
  res.locals.error=req.app.get('env')==='development'? err :{};

  res.status(err.status ||500);
  res.render('error');
});


module.exports = app;
