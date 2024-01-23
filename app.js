import { config } from 'dotenv';
config({path: './config.env'});

import express from 'express';
import morgan from 'morgan';
import cors from 'cors'
import sanitize from 'express-mongo-sanitize';
import xss from 'xss-clean'

import { errorHandler } from './src/middlewares/Handlers/errorHandler.js';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import apiResponse from './src/utils/apiResponse.js';
import passport from 'passport';
import './passport.js';


import userRoutes from './src/routes/users/userRoutes.js';
import todosRoutes from './src/routes/todos/todoRoutes.js'
import contactRoutes from './src/routes/contacts/contactRoutes.js'

import ecomProfileRoutes from './src/routes/Ecom/profile.route.js'
import ecomAddressRoutes from './src/routes/Ecom/address.route.js'
import ecomProductRoutes from './src/routes/Ecom/product.route.js'
import rateLimit from 'express-rate-limit';
import apiError from './src/utils/apiError.js';
import helmet from 'helmet';


const app= express();

////////EXPRESS MIDDLEWARES//////////////////
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*" === "*"? "*":process.env.CORS_ORIGIN?.split(','),
    credentials:true
}));

app.use(rateLimit({
    max:100,
    windowMs:20*60*1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_,__,___,options)=>{
        throw new apiError(`Too many requests! You are allowed only ${options.limit} 
        requests per ${options.windowMs/60000} minutes`, options.statusCode || 500);
    }
}));
app.use(morgan('dev'));

app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
/////////////////////////////////////////////

////////////FOR PASSPORT JS/////////////////////////////
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
////////////////////////////////////////////////////////

app.use(helmet({
    frameguard:{action:'sameorigin'}
})); /* according to the app requirements will change the options of helmet and will use more options */

app.use(sanitize());
app.use(xss());

            //ALL ROUTES//

// 1. User/Auth Routes            
app.use('/api/v1/users', userRoutes);

// 2. Todos Routes
app.use('/api/v1/todos', todosRoutes);

// 3. Contacts Routes
app.use('/api/v1/contacts', contactRoutes);

// 4. Ecom Routes
app.use('/api/v1/ecom', ecomProfileRoutes);
app.use('/api/v1/ecom', ecomAddressRoutes);
app.use('/api/v1/ecom', ecomProductRoutes);


// 5. For login with google
app.get('/', (req, res)=>{
    res.send('<a href=/auth/google> Login with Google </a>')
});


//Using a default handler for the routes not defined/doesn't exist for sending an appropriate response accordingly.
app.all('*', (req,res)=>{
res.status(404).json(new apiResponse('404',`cannot get ${req.originalUrl}`));
});


app.use(errorHandler);


export {app} 