import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoschema = new Schema(
  {
    videofile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    /*Timestamps in Mongoose are used to automatically manage and store the 
    creation and update times of documents in a MongoDB collection. 
    When enabled, Mongoose adds two fields to the schema:
createdAt: Records the timestamp when the document is first created.
updatedAt: Records the timestamp of the most recent update to the document. */
  }
);
videoschema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("User", videoschema);
