import {config} from 'dotenv';
config({path: './config.env'});
import {app} from './app.js'
import dbConnect from './src/database/dbConnection.js'
import path from "path";



dbConnect().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>console.log(`App listening on: ${process.env.PORT}`) )
}).then(()=>console.log(path.resolve())).catch((err)=>{
    console.log(err);
}); 

