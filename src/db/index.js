/*There are always chances that the database connection might not go through 
we can use try catch and promises  
The database is in the other continent so we should async await our requests*/
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {
  try {
    // Ensure no double slashes in URI
    const mongoURI = process.env.MONGODB_URI.endsWith("/")
      ? `${process.env.MONGODB_URI}${DB_NAME}`
      : `${process.env.MONGODB_URI}/${DB_NAME}`;

    const connectionInstance = await mongoose.connect(mongoURI);
    console.log(
      `\nMONGODB CONNECTED!! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR", error);
    process.exit(1);
  }
};

export default connectdb;
