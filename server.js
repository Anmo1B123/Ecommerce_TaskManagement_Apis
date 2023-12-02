import {app} from './app.js'
import {config} from 'dotenv';
import dbConnect from './src/database/dbConnection.js'
import path from "path";

config({path: './config.env'});

dbConnect().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>console.log(`App listening on: ${process.env.PORT}`) )
}).then(()=>console.log(path.resolve())).catch((err)=>{
    console.log(err);
}); 

