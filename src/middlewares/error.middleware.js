import mongoose from "mongoose";

import { Apierror } from "../utils/apierror.js";

const errorHandler = (err, req, res, next) => {
  let error = err; //we want to check what is happening and than export that
  if (!(error instanceof Apierror)) {
    const statuscode =
      error.statuscode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new Apierror(statuscode, message, error?.errors || [], err.stack); //making the error an instance of our Apierror so that we can control everything
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development"
      ? {
          stack: error.stack,
        }
      : {}),
  };
  return res.status(error.statuscode).json(response);
};
export { errorHandler };
