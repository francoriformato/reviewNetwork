let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const codeSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  cbookTitle: String,
  stillValid: Boolean,
  codeListUS : [{type:String}],
  codeListUK : [{type:String}],
  region: String
});

var codeModel = mongoose.model("code", codeSchema, "code");

module.exports = codeModel;
