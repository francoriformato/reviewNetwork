const addLocalBook = (Book) => ({ id, book_buyLinkUS, book_buyLinkUK, book_title, book_subtitle, book_author, book_imgLink, book_uploadedBy, book_codesUS, book_codesUK, book_reviews }) => {
  const book = new Book({
    id, book_buyLinkUS, book_buyLinkUK, book_title, book_subtitle, book_author, book_imgLink, book_uploadedBy, book_codesUS, book_codesUK, book_reviews
  })
  return book.save()
}

const getBooks = (Book) => () => {
  return Book.find({})
}


const getBookByLink = (Book) => async ({ book_buyLink }) => {
  return await Book.findOne({ book_buyLink })
}

module.exports = (Book) => {
  return {
    addLocalBook: addLocalBook(Book),
    getBooks: getBooks(Book),
    getBookByLink: getBookByLink(Book)
  }
}