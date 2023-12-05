import express from 'express';
import userRoutes from './src/routes/userRoutes.js';
import loginRoute from './src/routes/loginRoutes.js'
import { asyncHandler } from "./src/middlewares/asyncHandler.js";
import { errorHandler } from './src/middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const app= express()
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());


app.use('/api/v1/users', userRoutes);
app.use('/login', loginRoute)
app.get('/', (req, res)=>{
    
    res.send('working')
})
app.use(errorHandler);


export {app} 