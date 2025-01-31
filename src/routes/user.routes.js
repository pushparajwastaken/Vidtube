import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registeruser, logoutuser } from "../controllers/user.controller.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registeruser
);
//secured routes
router.route("/logout").post(verifyjwt, logoutuser); //this is a secured route
//means we have to inject our middleware to this so some processing can happen first

export default router;
