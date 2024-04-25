import mongoose from "mongoose";



export const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`); // For Online
        console.log(`Connected to database at host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('Error Connecting to Database: ',error);
        process.exit(1);
    }
}




