import dotenv from 'dotenv';
dotenv.config();
import { app } from './app.js';
import { connectDB } from './db/index.js';
const port = process.env.DEFAULT_PORT || 8000;


export const startServer = ()=>{
    connectDB()
    .then(()=>{
        // module.exports.handle = serverless(app);
        app.listen(port,()=>{
            console.log(`Server running on port http://localhost:${port}`);
        })
    })
    .catch((error)=>{
        console.log('DATABASE CONNECTION FAILED:',error);
    });
}






