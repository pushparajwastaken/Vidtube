//the whole point of the index is just ot listen on a port
//and then give us the feedback that yes we are listening
import { app } from "./app.js";
import dotenv from "dotenv";
import connectdb from "./db/index.js";
dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 8001;

connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`); //when injecting a variable use backticks
    });
  })
  .catch((err) => {
    console.log("MONGODB CONNECTION ERROR", err);
  });
