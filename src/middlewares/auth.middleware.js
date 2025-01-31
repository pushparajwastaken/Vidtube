import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { Apierror } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
export const verifyjwt = asynchandler(async (req, _, next) => {
  const token =
    req.cookies.accesstoken ||
    req.headers("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Apierror(401, "Unauthorized");
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshtoken"
    );
    if (!user) {
      throw new Apierror(401, "Unauthorized");
    }
    req.user = user;
    next(); //whenver we want to transfer flow control
  } catch (error) {
    throw new Apierror(401, error?.message || "Invalid Access Token");
  }
});
