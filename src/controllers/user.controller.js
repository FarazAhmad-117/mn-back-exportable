import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken =await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        if(!accessToken || !refreshToken){
            throw new ApiError(500,'Error Generating Access Token and Refresh Token');
        }
        return {accessToken,refreshToken};
    }catch(error){
        throw new ApiError(500,'Error Generating Access Token and Refresh Token');
    }
}



export const createAdmin = asyncHandler(async(req,res)=>{
    const {email,username,fullName,password} = req.body;

    if([fullName,email,username,password].some(field => field?.trim() === "") || !email || !username || !fullName || !password){
        throw new ApiError(400,"All Fields are required");
    }

    const existedAdmin = await User.findOne({
        $or:[{email},{username}]
    });
    if(existedAdmin && existedAdmin.role === 'admin'){
        throw new ApiError(409,'Admin Already Exists');
    }else if(existedAdmin && existedAdmin.role === 'user'){
        existedAdmin.role = 'admin';
        const data = await existedAdmin.save({validateBeforeSave:false});
        res
        .status(200)
        .json(new ApiResponse(
            200,
            {data},
            "User converted to admin Successfully"
        ));
        return;
    }

    const admin = await User.create({
        fullName,
        email,
        username,
        password,
        role:'admin'
    })

    if(!admin){
        throw new ApiError(500,"Could not create an Admin");
    }
    const data = await User.findById(admin._id).select("-password -refreshToken"); 

    res
    .status(201)
    .json(new ApiResponse(
        201,
        {data},
        "Admin created successfully"
    ));
})


export const createUser = asyncHandler(async(req,res)=>{
    const {email,username,fullName,password} = req.body;

    if([fullName,email,username,password].some(field => field?.trim() === "") || !email || !username || !fullName || !password){
        throw new ApiError(400,"All Fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{email},{username}]
    });
    if(existedUser){
        throw new ApiError(409,'User Already Exists');
    }

    const user = await User.create({
        fullName,
        email,
        username,
        password
    })

    if(!user){
        throw new ApiError(500,"Could not create a new User");
    }

    const data = await User.findById(user._id).select("-password -refreshToken"); 

    res
    .status(201)
    .json(new ApiResponse(
        201,
        {data},
        "User created successfully"
    ));
})


export const userLogin = asyncHandler(async(req,res)=>{
    const {emailOrUsername,password} = req.body;

    if([emailOrUsername,password].some(field=>field?.trim() === "") || !emailOrUsername || !password){
        throw new ApiError(400,"All fields are required");
    }

    const user = await User.findOne({
        $or:[
            {email:emailOrUsername.toLowerCase()},
            {username:emailOrUsername.toLowerCase()}
        ]
    });

    if(!user){
        throw new ApiError(404,'User does not Exists');
    }

    const isVerified = await user.isPasswordCorrect(password);
    if(!isVerified){
        throw new ApiError(401,"Invalid Credentials Provided");
    }

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    const data = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .cookie('accessToken',accessToken, options)
    .cookie('refreshToken',refreshToken, options)
    .json(new ApiResponse(
        200,
        {
            data,
            accessToken,
            refreshToken
        },
        "User LoggedIn Successfully"
    ));
})


export const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

// Temporaryly Login Service For Testing Only
export const verifyAdminLogin = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;

    if([email,password].some(field=>field?.trim() === "") || !password || !email){
        throw new ApiError(400,"Both Email And Password are required");
    }
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    loginStatus:true
                },
                "Admin LoggedIn Successfully"
            )
        );
    }else{
        throw new ApiError(404,"Invalid Credentials Provided");
    }
})


