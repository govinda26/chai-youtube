// -Inorder to logout a user we will have to first clear the cookies
// -Reset refreshToken

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //get access token from user
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    //decoding accessed token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //find user from decoded accessed token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    // console.log("Decoded user: ", user);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    //adding new request inside the "req" object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
