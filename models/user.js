var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  userdata: Object,
  // firstname: String,
  // lastname: String,
  // phone: String,
  // email: String,
  username: String,
  password: String
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);