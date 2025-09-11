import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    //find user with userId
    const user = await User.findById(userId); //this is working

    //generate Access and Refresh Tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //adding refreshToken inside db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    //returning created tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, userName, email, password } = req.body;

  //validation not empty
  if (
    [fullName, userName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are compulsary or required");
  }

  //check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required");
  }

  //upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar Image is not availabe in the local path");
  }

  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password,
    userName: userName.toLowerCase(),
  });

  //check for user creation
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user ");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get user details
  const { email, userName, password } = req.body;

  //check if user has passed username or email
  if (!(email || userName)) {
    throw new ApiError(400, "Username or email is required");
  }

  //check if user with entered username or email exists in db
  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) {
    throw new ApiError(
      404,
      "User with entered Email or Username does not exists in the db"
    );
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(402, "Incorrect Password");
  }

  //calling token function
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //creating logged in user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //creating options so that no one can modify cookies from the frontend
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //reseting refreshToken
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true } //will return new updated value
  );

  //creating options so that no one can modify cookies from the frontend
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get refresh token from user
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    //verify token received from user
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    //get user from db through decoded token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    //creating options so that no one can modify cookies from frontend
    const options = {
      httpOnly: true,
      secure: true,
    };

    //generating refreshToken
    const newRefreshToken = await generateAccessAndRefreshToken(user._id);

    const { accessToken, refreshToken } = newRefreshToken;

    //returning response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "New Refresh Token Created"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get new and old password from user
  const { oldPassword, newPassword } = req.body;
  if (!(oldPassword || newPassword)) {
    throw new ApiError(400, "Old and New Password are required Fields");
  }

  //get logged in user's details from middleWare
  const user = await User.findById(req.user?._id);

  //check if oldPassword provided by user is the correct one
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  //changing oldPassword with the newOne
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  //get new details from user
  const { email, userName } = req.body;
  if (!(email || userName)) {
    throw new ApiError(400, "All fields are required");
  }

  //update the new values
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { email: email, userName: userName } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  //get new avatar path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required");
  }

  //upload path on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  //get user and update path only "path"
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  //return
  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar Image Updated Successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  //get userName from the url
  const { userName } = req.params;
  if (!userName) {
    throw new ApiError(400, "Username is missing");
  }

  //
  const channel = await User.aggregate([
    //stage 1:-Get only specified user document's from db using $match
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    //stage 2:- get all the subscribers who are subscribed to user
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    //stage 3:- get all the channels user has subscribed to
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    //stage 4:-Counting elements inside the above arrays
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    //storing only necessary data in the final document
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched Successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    //Get logged in user
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    //add id from videos into watchHistory
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "history",
        pipeline: [
          {
            //get owner
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    //overwriting exising field
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
