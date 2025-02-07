import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createTweet = asynchandler(async (req, res) => {
  //TODO: create tweet
});

const getUserTweets = asynchandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asynchandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asynchandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
