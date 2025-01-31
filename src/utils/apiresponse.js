class Apiresponse {
  constructor(statuscode, data, message = "Success") {
    this.statuscode = statuscode;
    this.message = message;
    this.data = data;
    this.success = statuscode < 400; // true if status code is less than 400
  }
}
export { Apiresponse };
