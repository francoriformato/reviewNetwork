let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already registered"],
  },
  firstName: String,
  lastName: String,
  audibleUKNick: { type: String, default: "NULLO"},
  audibleUKLink: { type: String, default: "NULLO"},
  audibleUSNick: { type: String, default: "NULLO"},
  audibleUSLink: { type: String, default: "NULLO"},
  profilePhoto: String,
  password: String,
  source: { type: String, required: [true, "source not specified"] },
  lastVisited: { type: Date, default: new Date() }
});

var userModel = mongoose.model("user", userSchema, "user");

module.exports = userModel;
