import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registeruser,
  logoutuser,
  loginuser,
  refreshaccesstoken,
  changecurrentpassword,
  getcurrentuser,
  getuserchannelprofile,
  updateaccountdetails,
  updateuseravatar,
  getwatchhistory,
} from "../controllers/user.controller.js";
const router = Router();

//unsecured routes

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
router.route("/login").post(loginuser);
router.route("/refresh-token").post(refreshaccesstoken);
//secured routes
router.route("/logout").post(verifyjwt, logoutuser); //this is a secured route
//means we have to inject our middleware to this so some processing can happen first
router.route("/change-password").post(verifyjwt, changecurrentpassword);
router.route("/current-user").get(verifyjwt, getcurrentuser);
router.route("/c/:username").get(verifyjwt, getuserchannelprofile);
router.route("/update-account").patch(verifyjwt, updateaccountdetails);
router
  .route("/avatar")
  .patch(verifyjwt, upload.single("avatar"), updateuseravatar);
router
  .route("/cover-image")
  .patch(verifyjwt, upload.single("avatar"), updateuseravatar);
router.route("/history").get(verifyjwt, getwatchhistory);
export default router;
