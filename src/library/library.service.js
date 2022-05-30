const addLocalLibrary = (Library) => ({ id, email, givenCode, lregion, lbookTitle, book_buyLinkUS, book_buyLinkUK, book_subtitle, book_author, book_imgLink, givenReviewTitle, givenReviewBody}) => {
  const library = new Library({
    id, email, givenCode, lregion, lbookTitle, book_buyLinkUS, book_buyLinkUK, book_subtitle, book_author, book_imgLink, givenReviewTitle, givenReviewBody
  })
  return library.save()
}

const getLibrary = (Library) => () => {
  return Library.find({})
}

const getLibraryByEmail = (Library) => async ({ email }) => {
  return await Library.findOne({ email })
}

module.exports = (Library) => {
  return {
    addLocalLibrary: addLocalLibrary(Library),
    getLibrary: getLibrary(Library),
    getLibraryByEmail: getLibraryByEmail(Library)
  }
}