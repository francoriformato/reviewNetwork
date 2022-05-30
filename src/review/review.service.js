const addLocalReview = (Review) => ({ id, rbookTitle }) => {
  const review = new Review({
    id, rbookTitle
  })
  return review.save()
}

const getReviews = (Review) => () => {
  return Review.find({})
}

const getReviewByTitle = (Review) => async ({ rbookTitle }) => {
  return await Review.findOne({ rbookTitle })
}

module.exports = (Review) => {
  return {
    addLocalReview: addLocalReview(Review),
    getReviews: getReviews(Review),
    getReviewByTitle: getReviewByTitle(Review)
  }
}