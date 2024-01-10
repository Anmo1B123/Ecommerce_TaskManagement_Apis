import express from 'express';

import { config } from 'dotenv';
config({path: './config.env'});

import userRoutes from './src/routes/users/userRoutes.js';
import todosRoutes from './src/routes/todos/todoRoutes.js'
import contactRoutes from './src/routes/contacts/contactRoutes.js'

import ecomProfileRoutes from './src/routes/Ecom/profile.route.js'
import ecomAddressRoutes from './src/routes/Ecom/address.route.js'
import ecomProductRoutes from './src/routes/Ecom/product.route.js'


import { errorHandler } from './src/middlewares/Handlers/errorHandler.js';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import apiResponse from './src/utils/apiResponse.js';
import passport from 'passport';
import './passport.js';


const app= express();


////////////FOR PASSPORT JS/////////////////////////////

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
////////////////////////////////////////////////////////

////////EXPRESS MIDDLEWARES//////////////////
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
/////////////////////////////////////////////


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