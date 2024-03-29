import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
dotenv.config();
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Mongo Data Base Connected Successfully: ", conn.connection.host);
    }catch(error){
        console.log("error",error);
    }
}

export default connectDB;