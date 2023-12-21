import express from 'express';
import {config} from 'dotenv';
config({path: './config.env'});
import userRoutes from './src/routes/userRoutes.js';
import logRoutes from './src/routes/logRoutes.js'
import passwordChangeRoutes from './src/routes/passwordChangeRoutes.js'
import newAccessTokenRoutes from './src/routes/newAccessTokenGenerationRoute.js'
import todosRoutes from './src/routes/todoRoutes.js'
import contactRoutes from './src/routes/contactRoutes.js'
import { errorHandler } from './src/middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import apiResponse from './src/utils/apiResponse.js';

const app= express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/users', passwordChangeRoutes);
app.use('/api/v1/todos', todosRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/', logRoutes);
app.use('/', newAccessTokenRoutes);

app.get('/', (req, res)=>{
    res.send('working')
});

//Using a default handler for the routes not defined/doesn't exist for sending an appropriate response accordingly.
app.all('*', (req,res)=>{
res.status(404).json(new apiResponse('404',`cannot get ${req.originalUrl}`));
});


app.use(errorHandler);


export {app} 