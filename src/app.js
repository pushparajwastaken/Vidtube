import express from "express";
import cors from "cors"; //cors is a middleware
import cookieParser from "cookie-parser";
const app = express();
//middleware are inbetween configuration that are used to tasks in between configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//middleware can only be defined after the
//common middleware
app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
//HEALTH CHECK -LOGIC
//app.get("/healthcheck",()=>{
//})-Not a professional approach

//we want to bring in routes
import healthcheckrouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

//creating routes
app.use("/api/v1/healthcheck", healthcheckrouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);
export { app };
