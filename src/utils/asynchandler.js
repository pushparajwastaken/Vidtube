//the whole job of this asynchandler is to receive a function
//so the parameter passedo onto this asynchandler is a function in itself

const asynchandler = (requesthandler) => {
  //we're not executing the function we're wrapping it up and returning it back
  return (req, res, next) => {
    Promise.resolve(requesthandler(req, res, next)).catch((err) => next(err));
    //if the program resolves requesthandler gets executed with all it's parameter
    //in case of failure,we'll pass on the err to next
  }; //next is a middleware
};
export { asynchandler };
