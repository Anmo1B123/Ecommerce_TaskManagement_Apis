// import Redis from 'ioredis'

// function myfunc(){
//     console.log('hey')
// const redis = new Redis({
// host:process.env.REDIS_HOST,
// port:process.env.REDIS_PORT,
// password:process.env.REDIS_PASS

// })
// console.log('hi')
// return redis

// }const redis =myfunc()



import { createClient } from 'redis';


    const client = createClient({
        password: 'CL5FvDgYlkE4x0nz11DAn32nzqbv5ymd',
        socket: {
            host: 'redis-19600.c212.ap-south-1-1.ec2.cloud.redislabs.com',
            port: 19600
        }
    });
    
    client.connect().then(()=> console.log('Redis is now connected')).catch((err)=>console.log(err));

    //without using .connect the connection was not being made, since it returns a promise handled the same 
    //with promise handlers.



    export {client}



