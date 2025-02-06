import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import {
  uploadonCloudinary,
  deletefromcloudinary,
} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

//we'll create a function such that when we give it user id it genertes a toke
const generateaccessandrefreshtoken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Apierror(400, "User doesn't exist");
  }
  try {
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();
    //refresh token is something we can attach to the user
    //also we have declared it in the user model
    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new Apierror(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};
const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body; // Image fields will come via req.files
  // Validation
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new Apierror(400, "All fields are required");
  }

  // Check if user already exists
  const existeduser = await User.findOne({ $or: [{ username }, { email }] });
  if (existeduser) {
    throw new Apierror(409, "User with email or username already exists");
  }

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  const coverimagelocalpath = req.files?.coverimage?.[0]?.path;

  console.log("Avatar local path:", avatarlocalpath);
  console.log("Cover image local path:", coverimagelocalpath);

  if (!avatarlocalpath) {
    throw new Apierror(400, "Avatar file is missing");
  }
  if (!coverimagelocalpath) {
    throw new Apierror(400, "Cover image file is missing");
  }

  let avatar, coverimage;

  try {
    // Upload avatar to Cloudinary
    avatar = await uploadonCloudinary(avatarlocalpath);
    console.log("Uploaded Avatar", avatar);
    console.log("Avatar Public ID:", avatar.public_id);

    // Upload cover image to Cloudinary
    coverimage = await uploadonCloudinary(coverimagelocalpath);
    console.log("Uploaded Cover Image", coverimage);
  } catch (error) {
    console.log("Error Uploading images", error);
    throw new Apierror(500, "Failed to upload images");
  }

  try {
    // Create user
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverimage: coverimage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    // Verify user creation
    const createduser = await User.findById(user._id).select(
      "-password -refreshtoken -createdAt -updatedAt"
    );
    if (!createduser) {
      throw new Apierror(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new Apiresponse(200, createduser, "User Registered Successfully"));
  } catch (error) {
    console.log("User Creation Failed");

    // Delete uploaded images from Cloudinary if user creation fails
    if (avatar) {
      await deletefromcloudinary(avatar.public_id);
    }
    if (coverimage) {
      await deletefromcloudinary(coverimage.public_id);
    }

    throw new Apierror(
      500,
      "Something went wrong while registering the user and images were deleted"
    );
  }
});
const loginuser = asynchandler(async (req, res) => {
  //get data from body
  const { email, username, password } = req.body;
  //validation
  if (!email || !username || !password) {
    throw new Apierror(400, "All fields are required required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new Apierror(404, "User Not Found");
  }
  //validate password
  const isPasswordValid = await user.ispasswordcorrect(password);
  if (!isPasswordValid) {
    throw new Apierror(401, "Invalid Password");
  }
  //generate token
  const { accesstoken, refreshtoken } = await generateaccessandrefreshtoken(
    user._id
  );
  //select is not used for selection but for deselection
  const loggedinuser = await User.findById(user._id).select(
    "-password -refreshtoken "
  );
  const options = {
    httpOnly: true, //this makes the cookie non-modifiable by the browser
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new Apiresponse(
        200,
        { user: loggedinuser, accesstoken, refreshtoken },
        "User logged in successfully"
      )
    );
});
const logoutuser = asynchandler(async (req, res) => {
  //get accesstoken from cookie
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true, //this makes the cookie non-modifiable by the browser
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new Apiresponse(200, {}, "User Logged Out Successfully"));
});

//building refresh tokens
const refreshaccesstoken = asynchandler(async (req, res) => {
  const incomingrefreshtoken =
    req.cookies.refreshtoken || req.body.refreshtoken;
  if (!incomingrefreshtoken) {
    throw new Apierror(401, "Refresh Token is requried");
  }
  //we can try to find the incoming refresh token in the database
  //but we can get failure while doing that so we'll wrap it up in a try-catch block
  try {
    //decoding the token because we need to extract the information from it\
    const decodedtoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_EXPIRY
    );
    //verifying the token
    const user = await User.findById(decodedtoken?._id);
    if (!user) {
      throw new Apierror(401, "Invalid Refresh Token");
    }
    if (incomingrefreshtoken !== user?.refreshtoken) {
      throw new Apierror(401, "Invalid Refresh Token");
    }
    const options = {
      httpOnly: true, //this makes the cookie non-modifiable by the browser
      secure: process.env.NODE_ENV === "production",
    };
    const { accesstoken, refreshtoken: newrefreshtoken } =
      await generateaccessandrefreshtoken(user._id);
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", newrefreshtoken, options)
      .json(
        new Apiresponse(
          200,
          { accesstoken, refreshtoken: newrefreshtoken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new Apierror(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});
const changecurrentpassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req, user?._id);
  const isPasswordValid = await user.ispasswordcorrect(oldpassword);
  if (!isPasswordValid) {
    throw new Apierror(401, "Old Password is Incorrect");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json((200, {}, "Password Changed Successfully"));
});
const getcurrentuser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, req.user, "Current User Details"));
});
const updateaccountdetails = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new Apierror(400, "Fullname and Email are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true, //we want the updated information to come
    }
  ).select("-password -refreshtoken");
  return res
    .status(200)
    .json(new Apiresponse(200, user, "Account Details Updated Successfully"));
});
const updateuseravatar = asynchandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;
  if (!avatarlocalpath) {
    throw new Apierror(400, "File is required");
  }
  const avatar = await uploadonCloudinary(avatarlocalpath);
  if (!avatar.url) {
    throw new Apierror(
      500,
      "Something  went wrong  while uploading  to  cloudinary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true, //we want the updated information to come
    }
  ).select("-password -refreshtoken");
  return res
    .status(200)
    .json(new Apiresponse(200, user, "Avatar Updated Successfully"));
});
const updautecoverimage = asynchandler(async (req, res) => {
  const coverimagelocalpath = req.file?.path;
  if (!coverimagelocalpath) {
    throw new Apierror(400, "File is required");
  }
  const coverimage = await uploadonCloudinary(coverimagelocalpath);
  if (!coverimage.url) {
    throw new Apierror(
      500,
      "Something  went wrong  while uploading  to  cloudinary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    {
      new: true, //we want the updated information to come
    }
  ).select("-password -refreshtoken");
  return res
    .status(200)
    .json(new Apiresponse(200, user, "Avatar Updated Successfully"));
});
const getuserchannelprofile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new Apierror(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedto",
      },
    },
    {
      $addFields: {
        subscribercount: {
          $size: "$subscribers",
        },
        channelsubscribedtocount: {
          $size: "$subscribedto",
        },
      },
    },
    {
      $addFields: {
        subscriberscount: {
          $size: "$subscribers",
        },
        channelsubscribedtocount: {
          $size: "$subscribedto",
        },
        issubscribed: {
          $cind: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      //project only the necessary data
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        subscriberscount: 1,
        channelsubscribedtocount: 1,
        issubscribed: 1,
        coverimage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new Apierror(404, "Channel Not Found");
  }
  return res
    .status(200)
    .json(
      new Apiresponse(200, channel[0], "Channel Profile Fetched Successfully")
    );
});
const getwatchhistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id), //we have to give an explicitly designed mongoose id
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchhistory",
        foreignfield: "_id",
        as: "watchhistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        user[0]?.watchhistory,
        "Watch History Fetched Successfully"
      )
    );
});
export {
  registeruser,
  loginuser,
  refreshaccesstoken,
  logoutuser,
  changecurrentpassword,
  getcurrentuser,
  getuserchannelprofile,
  updateaccountdetails,
  updateuseravatar,
  updautecoverimage,
  getwatchhistory,
};
