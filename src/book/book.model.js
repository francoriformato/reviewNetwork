let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const bookSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  book_buyLinkUS: {
    type: String,
    required: [true, "audible buy link required"],
    unique: [true, "audible buy link already registered"],
  },
  book_buyLinkUK: {
    type: String,
    required: [true, "audible buy link required"],
    unique: [true, "audible buy link already registered"],
  },
  book_title: String,
  book_subtitle: String,
  book_author: String,
  book_imgLink: String,
  book_uploadedBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  book_codesUS: String,
  book_codesUK: String,	
  book_reviews: String
});

var bookModel = mongoose.model("book", bookSchema, "book");

module.exports = bookModel;
