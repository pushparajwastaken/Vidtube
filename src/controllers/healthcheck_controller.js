import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

//we want to send api response so we'll import
//apiresponse class from utils folder

//CREATING A HEALTH CHECK

//the main use of async handler is to wrap everything in a promise so we can handle errors in a beterr way

const healthcheck = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, "Ok", "Health Check Passed"));
});
export { healthcheck };
