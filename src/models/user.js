import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//step1 create schema
const userSchema = mongoose.Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String,   //Cloduinary url
        required:true
    },
    coverImage:{
        type:String,
        // required:true
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
},
{
    timeStamps:true
});


userSchema.pre("save", async function(next){
// each time we update user password will update its hash password,
//So we need to check ,should i have modified passwords
if(!this.isModified("password"))return next();


this.password = await  bcrypt.hash(this.password,10);
next();
});

// Note here we are not using async functions
// becaues we have to use this keyword
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.createAccessTokens =  function(){
    return  jwt.sign(
        {
        _id:this._id,
        fullname:this.fullname,
        email:this.email,
        username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.createRefreshTokens = function(){
    return jwt.sign(
        {
        _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


// create model
export const User = mongoose.model("User",userSchema);