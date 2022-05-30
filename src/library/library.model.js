let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const librarySchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "email required"],
  },
  givenCode: String,
  book_buyLinkUS: String,
  book_buyLinkUK: String,
  book_subtitle: String,
  book_author: String,
  book_imgLink: String,
  lbookTitle: String,
  lregion: String,
  givenReviewTitle: String,
  givenReviewBody: String,
  reviewJPEG: String,
  reviewDATE: {
    type: Date,
  },
  codeCollectedDATE: {
    type: Date,
    default: Date.now,
  }
});

var libraryModel = mongoose.model("library", librarySchema, "library");

module.exports = libraryModel;
