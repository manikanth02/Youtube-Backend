import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Fetching data from req
  const { username, fullname, email, password } = req.body;
  // console.log({username:username});

  // Step 2: Applying validations on each field
  if ([username, fullname, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
}


  // Step 3: We are searching if the user is already registered or not
  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  //step 4::User also send cover photos and avatr .We fetch files using multer and
  // store in server and now we upload them on cloudinary
  const avatarFilePath = req.files?.avatar[0]?.path;
//   const coverImageFilePath = req.files?.coverImage[0]?.path;

  if(!avatarFilePath){
    throw new ApiError(400, "Please provide an avatar ");
  }

  let coverImageFilePath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
     coverImageFilePath = req.files?.coverImage[0]?.path 
  }

  const avatar = await uploadOnCloudinary(avatarFilePath);
  const coverImage = coverImageFilePath && await uploadOnCloudinary(coverImageFilePath);

  if(!avatar){
    throw new Error("Something went wrong while uploading avatar");
  }
//   if(!coverImage){
//     throw new Error("Something went wrong while uploading cover image");
//   }

  const user = await User.create({
    username:username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avatar.url,
    coverImage:coverImage?.url || ""
  });

  const createdUser = await User.findById({_id:user?._id}).select("-password -refreshToken");

  if(!createdUser){
    throw new Error("Something went wrong while registerings user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully")
  ) 


});


const generateAccessandRefreshTokens = async (user) =>{
  try{
    const accessToken =  user.createAccessTokens();
    const refreshToken =  user.createRefreshTokens();

     user.refreshToken = refreshToken;

    await user.save({validateBeforeSave:false});

    return {accessToken, refreshToken};

  }catch(error){
    throw new ApiError(400,`Sonething went wrongs while generating tokens ${error}`);
  }
}


const loginUser = asyncHandler(async (req,res) => {

  // step1::  fetching data from request Body
    const {email  , username ,   password} = req.body;
    console.log({password:password});
    //step2:: Checking is user is presents on database or not
    const user = await User.findOne({ 
      $or:[{ username }, { email}]
    });

    if(!user){
      throw new ApiError(400, "User not found");
    }

    //step3:: check Password
    const isMatch = await user.comparePassword(password);

    if(!isMatch){
      throw new ApiError(400, "Please Provide Correct Password");
    }

    //step4:: 

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user);
    console.log({accessToken:accessToken,refreshToken:refreshToken});

    // rename the passwords and refreshTokens becaues if we destructure same 
    // name it give error becaues we have also destructure password and refersh Tokens 
    //previously
    const  {password : userPassword, refreshToken : userRefreshTokens,...otherDetails} = user._doc;
    console.log({otherDetails:otherDetails});
    const options = {
      httpOnly:true,
      secure:true,
      sameSite: "strict"
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {userss:otherDetails,accessToken,refreshToken},
        "User logged  in successfully"
        )
    );
})

const logoutUser = asyncHandler(async (req,res) => {
  await User.findByIdAndUpdate(req.user?._id,
  {
    $set:{
      refreshToken:undefined
    }
  },
  {
    new:true
  });


  const options = {
    httpOnly:true,
    secure:true,
    sameSite: "strict"
  }


  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json( new ApiError(200,{},"user logged out successfully"))
})


const refreshAccessToken = asyncHandler(async (req,res) => {
try {
    // get refresh tokens
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
    // validate refresh Tokens
    if(!incomingRefreshToken){
      throw new ApiError(400, "Please provide refresh token");
    }
  
    const decodeTokens = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  
    const user = await User.findOne({_id:incomingRefreshToken?._id}).select("-password");
  
    // it adds extra layers of security
    if(user?.refreshToken !== incomingRefreshToken){
      throw new ApiError(400, "Invalid refresh token");
    }
  
    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user);
  
    const options = {
      httpOnly:true,
      secure:true,
      sameSite: "strict"
    }
  
    return res
    .status(200)
    .cookies("accessToken",accessToken,options)
    .cookies("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(200, {accessToken,refreshToken}, "Access token refreshed successfully")
    )
} catch (error) {
  throw new ApiError(400,`Something went wrong while refreshing access token ${error}`); 
}
})


const changePassword = asyncHandler(async (req,res) => {
  try{
      const {oldPassword, newPassword} = req.body;
      const user = await User.findById(req.user?._id);
      const isPasswordCorrect = await user.comparePassword(oldPassword);
      if(!isPasswordCorrect){
        throw new ApiError(400, "Please provide correct old password");
      }

      user.password = newPassword;
      await user.save({validateBeforeSave:false});
      return res
      .status(200)
      .json(new ApiResponse(200, {},"Password changed successfully"));
  }catch(error){

  }
})

const getCurrentUser = asyncHandler(async (req,res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "User fetched successfully"))
});

const updateAccountDetails = asyncHandler(async (req,res) => {

  const {fullname,email} = req.body;
  
  if(!fullname  || !email){
    throw new ApiError(400, "Please provide fullname and email");
  }

  await findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },{new:true}).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
  // multer store file and send path
  const avatarFile = req.file?.path;

  if(!avatarFile){
    throw new ApiError(400,"Avatar file is missings");
  }

  const avatar = await uploadOnCloudinary(avatarFile);

  if(!avatar.url){
    throw new ApiError(400,"Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
      avatar:avatar.url
    }
    },
    {
      new:true
    }
    ).select("-password");

  if(!avatarFile){
    throw new ApiError(400,"Avatar file is missings");
  }

  return res.status(200)
  .json(200,user,"Avatar updated successfully");
})


const updateUserCover = asyncHandler(async(req,res) => {
  // multer store file and send path
  const coverFile = req.file?.path;

  if(!coverFile){
    throw new ApiError(400,"Avatar file is missings");
  }

  const cover = await uploadOnCloudinary(coverFile);

  if(!cover.url){
    throw new ApiError(400,"Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
      coverImage:cover.url
    }
    },
    {
      new:true
    }
    ).select("-password");

  if(!avatarFile){
    throw new ApiError(400,"Cover Image file is missings");
  }

  return res
  .status(200)
  .json(200,user,"Cover Image updated successfully");
})


const getChannelUserProfile = asyncHandler(async(req,res) =>{
  const {username} = req.params;

  if(!username?.trim()){
    throw new ApiError(400,"Please provide username");
  }

  const channel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribeTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelSubscribedsToCount:{
          $size:"$subscribeTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id, "$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1

      }
  }
  ]);

  if(!channel[0]){
    throw new ApiError(404,"Channel doesn't exists");
  }


  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"User Channel fetched successfully")
  )
})

export { registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover,
  getChannelUserProfile
};
