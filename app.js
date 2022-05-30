require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const UserService = require("./src/user");
const BookService = require("./src/book");
const CodeService = require("./src/code");
const LibraryService = require("./src/library");
const ReviewService = require("./src/review");

const User_model=require('./src/user/user.model.js');
const Book_model=require('./src/book/book.model.js');
const Code_model=require('./src/code/code.model.js');
const Library_model=require('./src/library/library.model.js');
const Review_model=require('./src/review/review.model.js');

require("./src/config/passport");
require("./src/config/local");


const mongodbUri = "mongodb+srv://francorif:<PASSWORD MONGODB>@audiblecluster.9gpdo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(
  mongodbUri,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (error) => {
    if (error) console.log(error);
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));

app.use(cookieParser());
app.use(
  session({
    secret: "secr3t",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};


app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/landing", (req, res) => {
  res.render("landing.ejs");
});

app.get("/local/signup", (req, res) => {
  res.render("local/signup.ejs");
});

app.get("/local/signin", (req, res) => {
  res.render("local/signin.ejs");
});


app.get("/allowedToGo", isLoggedIn, async (req, res) => {
  
  var bookCounter = await Book_model.find().estimatedDocumentCount();

  var bookListDated = await Book_model.find().sort('-createdAt').exec();

  res.render("shopPage.ejs", { user: req.user, bookcount: bookCounter, orderedbooklist: bookListDated});
});


app.get("/accountInformations", isLoggedIn, async (req, res) => {
  
  res.render("accountPage.ejs", { user: req.user});
});

app.get("/myLibrary", isLoggedIn, async (req, res) => {

  var bookInLibrary = await Library_model.find({ email: req.user.email}).sort('codeCollectedDATE');

  //JOIN LIBRERIA UTENTE & LISTA TOTALE DEI LIBRI
  var distinctLibraryBooks = await Library_model.distinct("lbookTitle").exec();

  //var myBooksDetails = await Book_model.find({ book_title: {$in : distinctLibraryBooks} }).sort('book_title');

   //CONTATORE LIBRI IN LIBRERIA
   var libraryCounter = await Library_model.count({
						    'email' : req.user.email
						   }).exec();

  if (libraryCounter == 0)
	{
		res.render("myEmpty.ejs");
	}
  else {
	res.render("myLibrary.ejs", { user: req.user, myLibraryData : bookInLibrary, myLibraryExtended : bookInLibrary, myLibraryCounter : libraryCounter });
	}
});

app.get("/bookUpload", isLoggedIn, (req, res) => {
  res.render("bookUpload.ejs", { user: req.user });
});


app.get("/auth/logout", (req, res) => {
  req.flash("success", "Log-out effettuato con successo.");
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.post("/auth/local/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  if (password.length < 8) {
    req.flash("error", "Account NON creato, la password deve essere lunga almeno 7 caratteri");
    return res.redirect("/local/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await UserService.addLocalUser({
      id: uuid.v4(),
      email,
      firstName: first_name,
      lastName: last_name,
      password: hashedPassword
    })
  } catch (e) {
    req.flash("error", "Errore durante la creazione dell'account.");
    res.redirect("/local/signup")
  }

  res.redirect("/local/signin")
});

app.post("/auth/local/signin",
  passport.authenticate("local", {
    successRedirect: "/allowedToGo",
    failureRedirect: "/local/signin",
    failureFlash: true
  })
);

//Book Routes
app.get("/product", isLoggedIn, async (req, res) => {
  var activeBook = await Book_model.find({ id: req.query.bookID }).exec();

  var yetClaimedUS = await Library_model.count({
						    'email' : req.user.email,
						    'lbookTitle' : activeBook[0].book_title,
						    'lregion' : "US"
						   }).exec();

  var yetClaimedUK = await Library_model.count({
						    'email' : req.user.email,
						    'lbookTitle' : activeBook[0].book_title,
						    'lregion' : "UK"
						   }).exec();

  console.log(yetClaimedUS);
  console.log(yetClaimedUK);
  
  res.render("itemPage.ejs", { productIdentifier: activeBook, user: req.user, yetObtainedUS : yetClaimedUS, yetObtainedUK : yetClaimedUK });
});


app.post("/serverBookUpload", async (req, res) => {
  const { book_buyLinkUS, book_buyLinkUK, book_title, book_subtitle, book_author, book_imgLink, book_uploadedBy, book_codesUS, book_codesUK, book_reviews } = req.body

  try {
     
    await BookService.addLocalBook({
      id: uuid.v4(),
      book_buyLinkUS: book_buyLinkUS,
      book_buyLinkUK: book_buyLinkUK,
      book_title: book_title,
      book_subtitle: book_subtitle,
      book_author: book_author,
      book_imgLink: book_imgLink,
      book_uploadedBy : book_uploadedBy,
      book_codesUS: book_codesUS,
      book_codesUK: book_codesUK,
      book_reviews: book_reviews
    });

    await CodeService.addLocalCode({
      id: uuid.v4(),
      cbookTitle: book_title,
      stillValid: 1
    });	

    await Code_model.findOneAndUpdate(
	{ cbookTitle: book_title },
	{$push: {codeListUS: book_codesUS.split("\n")}},	
	{ new: true }
				     );

    await Code_model.findOneAndUpdate(
	{ cbookTitle: book_title },
	{$push: {codeListUK: book_codesUK.split("\n")}},	
	{ new: true }
				     );


    await ReviewService.addLocalReview({
      id: uuid.v4(),
      rbookTitle: book_title
    });

    await Review_model.findOneAndUpdate(
	{ rbookTitle: book_title },
	{$push: {reviewList: book_reviews.split("\r\n\r\n\r\n")}},
	{ new: true }
				     );

  } catch (e) {
    req.flash("error", "Errore durante inserimento del libro.");
    res.redirect("/")
  }

  res.redirect("/allowedToGo")
});

app.get("/updateLibraryUS", async (req, res) => {

  try { 
    var redeemedBook = await Book_model.find({ id: req.query.bookID }).exec();

    var usedCodes = await Library_model.distinct("givenCode");

    var usedReviews = await Library_model.aggregate([
				{ "$match": { "lbookTitle" : redeemedBook[0].book_title } },
				{ $project: { "givenReviewTitle" : 1, "givenReviewBody": 1, _id: 0} }
						]).exec();

    var choosenCode = await Code_model.aggregate([
				{ $unwind: "$codeListUS"},
				{ "$match": { "codeListUS": {$nin: usedCodes}, "cbookTitle" : redeemedBook[0].book_title } }
						]);

    var choosenReview = await Review_model.aggregate([
				{ $unwind: "$reviewList"},
				{ "$match": { "reviewList.0": {$nin: usedReviews}, "rbookTitle" : redeemedBook[0].book_title } }
						]);

    var reviewCounter = await Review_model.aggregate([
							{ "$match": { "rbookTitle" : redeemedBook[0].book_title } },
							{ $project: { count: { $size:"$reviewList" }}}
							]).exec();

    console.log("CHOOSENREVIEW:")
    console.log(choosenReview);
    console.log("USEDREVIEWS:");
    console.log(usedReviews);
    console.log("REVIEW COUNTER:");
    console.log(reviewCounter[0].count);
    var random = Math.floor(Math.random() * (reviewCounter[0].count - 0 + 1));
    console.log(random);
   
    var splittedReview = choosenReview[random].reviewList.split("\r\n");

    console.log("SPLITTEDREVIEW:");
    console.log(splittedReview);

    await LibraryService.addLocalLibrary({
      id: uuid.v4(),
      email: req.user.email,
      givenCode: choosenCode[0].codeListUS,
      lbookTitle: redeemedBook[0].book_title,
      lregion: "US",
      book_buyLinkUS: redeemedBook[0].book_buyLinkUS,
      book_buyLinkUK: redeemedBook[0].book_buyLinkUK,
      book_subtitle: redeemedBook[0].book_subtitle,
      book_author: redeemedBook[0].book_author,
      book_imgLink: redeemedBook[0].book_imgLink,
      givenReviewTitle: splittedReview[0],
      givenReviewBody: splittedReview[1]
    });

    res.redirect("/myLibrary")
  } catch (e) {
    req.flash("error", "Errore durante aggiornamento della libreria.");
    res.redirect("/")
  }

});


app.get("/updateLibraryUK", async (req, res) => {

  try { 
    var redeemedBook = await Book_model.find({ id: req.query.bookID }).exec();

    var usedCodes = await Library_model.distinct("givenCode");

    var usedReviews = await Library_model.aggregate([
				{ "$match": { "lbookTitle" : redeemedBook[0].book_title } },
				{ $project: { "givenReviewTitle" : 1, "givenReviewBody": 1, _id: 0} }
						]).exec();

    var choosenCode = await Code_model.aggregate([
				{ $unwind: "$codeListUK"},
				{ "$match": { "codeListUK": {$nin: usedCodes}, "cbookTitle" : redeemedBook[0].book_title } }
						]);

    var choosenReview = await Review_model.aggregate([
				{ $unwind: "$reviewList"},
				{ "$match": { "reviewList.0": {$nin: usedReviews}, "rbookTitle" : redeemedBook[0].book_title } }
						]);

    var reviewCounter = await Review_model.aggregate([
							{ "$match": { "rbookTitle" : redeemedBook[0].book_title } },
							{ $project: { count: { $size:"$reviewList" }}}
							]).exec();

    console.log("CHOOSENREVIEW:")
    console.log(choosenReview);
    console.log("USEDREVIEWS:");
    console.log(usedReviews);
    console.log("REVIEW COUNTER:");
    console.log(reviewCounter[0].count);
    var random = Math.floor(Math.random() * (reviewCounter[0].count - 0 + 1));
    console.log(random);
   
    var splittedReview = choosenReview[random].reviewList.split("\r\n");

    console.log("SPLITTEDREVIEW:");
    console.log(splittedReview);

    await LibraryService.addLocalLibrary({
      id: uuid.v4(),
      email: req.user.email,
      givenCode: choosenCode[0].codeListUK,
      lbookTitle: redeemedBook[0].book_title,
      lregion: "UK",
      book_buyLinkUS: redeemedBook[0].book_buyLinkUS,
      book_buyLinkUK: redeemedBook[0].book_buyLinkUK,
      book_subtitle: redeemedBook[0].book_subtitle,
      book_author: redeemedBook[0].book_author,
      book_imgLink: redeemedBook[0].book_imgLink,
      givenReviewTitle: splittedReview[0],
      givenReviewBody: splittedReview[1]
    });

    res.redirect("/myLibrary")
  } catch (e) {
    req.flash("error", "Errore durante aggiornamento della libreria.");
    res.redirect("/")
  }

});



app.post("/addAudibleUSDetails", async (req, res) => {
  const { audibleUSNick, audibleUSLink } = req.body

  var USNickname = audibleUSNick;
  var USLink = audibleUSLink;

  try {
	await User_model.findOneAndUpdate(
	{ email: req.user.email },
	{ audibleUSNick: USNickname },
	{ new: true }
					);
     
        await User_model.findOneAndUpdate(
	{ email: req.user.email },
	{ audibleUSLink: USLink },
	{ new: true }
					);

	
	res.redirect("/allowedToGo")

  } catch (e) {
    req.flash("error", "Errore durante l'inserimento di account US");
    res.redirect("/")
  }

});


app.post("/addAudibleUKDetails", async (req, res) => {
  const { audibleUKNick, audibleUKLink } = req.body

  var UKNickname = audibleUKNick;
  var UKLink = audibleUKLink;

  try {
	await User_model.findOneAndUpdate(
	{ email: req.user.email },
	{ audibleUKNick: UKNickname },
	{ new: true }
					);
     
        await User_model.findOneAndUpdate(
	{ email: req.user.email },
	{ audibleUKLink: UKLink },
	{ new: true }
					);

	
	res.redirect("/allowedToGo")

  } catch (e) {
    req.flash("error", "Errore durante l'inserimento di account US");
    res.redirect("/")
  }

});




var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

app.listen(port, function () {
  console.log(`Audio Sharing Academy - Server Principale listening on port ${port}`);
});