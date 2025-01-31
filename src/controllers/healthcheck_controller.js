import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

//we want to send api response so we'll import
//apiresponse class from utils folder

//CREATING A HEALTH CHECK

// const healthcheck =async(req,res)=>{//making it async because of database connection
//     //there's no guarantee that the connection will happen everytime so we have to use try catch
//     try {
//         res.status(200).json
//     } catch (error) {
//     }
// }
//But we don't want to do try and catch all the time so we'll use the async handler already being built up

//the main use of async handler is to wrap everything in a promise so we can handle errors in a beterr way

const healthcheck = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, "Ok", "Health Check Passed"));
});
export { healthcheck };
