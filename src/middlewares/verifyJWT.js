import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req,res,next) => {
    try{
        // step1:: get tokens
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        // console.log({accessToken:token});
        if(!token){
            throw new ApiError(400,"UnAuthorised  Tokens requests");
        }
        //step2::verify token

        // console.log("here");
        const decodedTokens =   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        // console.log("here1222")
        // console.log("decodedTokens",decodedTokens); 
        const user = await User.findById({_id:decodedTokens?._id});
        // console.log("user",user);
        if(!user){
            throw new ApiError("Invalid accessTokens")
        }
        req.user = user;
        next();
    }catch(error){
        throw new ApiError(400,"UnAuthorised Tokens");
    }
})