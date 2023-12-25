import {config} from 'dotenv';
config({
    path: './config.env',
});
process.on('uncaughtException', (err)=>{
    console.log(err.name, err.message);    
    console.log('Uncaught Exception occured! shutting down....');
    process.exit(1);
});

import {app} from './app.js'
import dbConnect from './src/database/dbConnection.js'





let server;
let port;

dbConnect().then(()=>{

    app.set('port', process.env.PORT || 8000);
    server=app.listen(app.get('port'), ()=>console.log(`App listening on: ${process.env.PORT}`) );
    port=app.get('port')
console.log(port)
    // server=app.listen(process.env.PORT || 8000, ()=>console.log(`App listening on: ${process.env.PORT}`) )
}).then(()=>console.log()).catch((err)=>{
    console.log(err);
}); 

process.on('unhandledRejection', (err)=>{
console.log(err.name, err.message);
console.log('Unhandled Rejection Occured! shutting down....');
server.close(()=>{
    process.exit(1);
});
});



export {port};//using in a url to be sent to the user for password change.

