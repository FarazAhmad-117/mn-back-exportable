import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async(req,_,next)=>{
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"Unautorized Request From JWT Verify");
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(
        decodedToken._id
    ).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"User not found")
    }
    req.user = user;
    next();
    // try {
    // } catch (error) {
    //     throw new ApiError(401,"Unautorized Access");
    // }
});



