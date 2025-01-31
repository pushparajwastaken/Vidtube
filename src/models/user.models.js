/* id string pk
  watchhistory ObjectId videos
  username string
  email string
  Fullname string
  avatar string
  coverimage string
  password string
  refreshtoken string
  createdat Date
  updatedat Date
  */

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// a schema is typically used to define the structure, shape, or rules of data. It is often
//  utilized in contexts such as validating data, defining the structure
// of databases, or working with frameworks and libraries.
//destructuring the schema so we don't have to create a schema everytime
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      //A Cloudinary URL is used to access and manipulate images, videos, or
      // other media stored in a Cloudinary account.
      // Cloudinary provides a Content Delivery Network (CDN) URL for media assets, allowing for efficient delivery and dynamic transformations.
      required: true,
    },
    coverimage: {
      type: String,
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", //this is the name which will be exported like User in this file
      },
    ],
    password: {
      type: String, //this will be an encryoted string we'll work on the encryoted part later
      required: [true, "Password is required"],
    },
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessTokens = function () {
  //short lived access token
  return jwt.sign(
    {
      _id: this._id, //underscore id means a unique way to find the id of the user when needed
      email: this.email,
      username: this.username,
    },

    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = function () {
  //short lived refresh token
  return jwt.sign(
    {
      _id: this._id, //here we are storing only the id
    },

    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
//this says that "Hey mongoose i want to create a new model and that database will be called User and follow the structure of
// userschema"
