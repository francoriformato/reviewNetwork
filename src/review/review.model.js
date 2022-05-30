let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const reviewSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  rbookTitle: String,
  reviewList : [{type:String}]
});

var reviewModel = mongoose.model("review", reviewSchema, "review");

module.exports = reviewModel;
