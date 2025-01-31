class Apierror extends Error {
  constructor(statuscode, errors = [], stack = "", message = "Failure") {
    super(message); //have to use the super so we can use the constructor from the parent class
    this.statuscode = statuscode;
    this.message = message;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { Apierror };
