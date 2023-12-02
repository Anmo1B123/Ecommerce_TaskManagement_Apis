import mongoose from 'mongoose';
const dbName='projectDB';
const dbConnect =  async function(){
try {
    const Connection =await mongoose.connect(`${process.env.MONGODB_URI}`, {dbName
        ,useNewUrlParser: true,
        useUnifiedTopology: true,});
    console.log(`MONGODB CONNECTED ON HOST: ${Connection.connection.host}`)

} catch (error) {
    console.log(error);
    process.exit(1);
}

}



export default dbConnect