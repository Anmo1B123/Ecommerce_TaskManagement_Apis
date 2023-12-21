import { createClient } from 'redis';

const password= process.env.REDIS_PASS;
const host= process.env.REDIS_HOST;
const port= process.env.REDIS_PORT;

    const client = createClient({
        password,
        socket: {
            host,
            port
        }
    });
    
    client.connect().then(()=> console.log('Redis is now connected')).catch((err)=>console.log(process.env.REDIS_HOST));

    //without using .connect the connection was not being made, since it returns a promise handled the same 
    //with promise handlers.



    export {client}



