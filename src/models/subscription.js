import mongoose  from "mongoose";

const subscriptionSchema = mongoose.Schema({
    // jiss channel Ko hum subscribes karengae like Chai and Code,Akshay saini,Enginnering Digest
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    // kon user ise channel ko subscribe karega 
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

export const Subscription = mongoose.model("Subscription",subscriptionSchema);