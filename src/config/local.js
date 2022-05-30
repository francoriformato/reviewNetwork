const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const UserService = require('../user')
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
  async function (email, password, done) {
    const currentUser = await UserService.getUserByEmail({ email })

    if (!currentUser) {
      return done(null, false, { message: `Non esiste un utente con email: ${email} ` });
    }

    if (currentUser.source != "local") {
      return done(null, false, { message: `Problemi con accesso: multipli metodi utilizzati` });
    }

    if (!bcrypt.compareSync(password, currentUser.password)) {
      return done(null, false, { message: `Password errata` });
    }
    return done(null, currentUser);
  }
));