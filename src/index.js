import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is running on PORT ${process.env.PORT}`);
    })
}) 
.catch(error =>{
    const err = new Error(error);
    console.log(err);
})












/*
(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}`/`${DB_NAME}`);

        app.on("error",(error) => {
            console.log(error);
            throw err;
        });

        app.listen(process.env.PORT, () => {
            console.log("App is running on PORT");
        })

    }catch(error){
        const err = new Error(error);
        console.log(err);
    }
})()

*/