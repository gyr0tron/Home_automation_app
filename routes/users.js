var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/auth");
var db = mongoose.connection;

// Register
router.get('/register', function (req, res) {
  res.render('register');
});

// Login
router.get('/login', function (req, res) {
  res.render('login');
});

// Register User
router.post('/register', function (req, res) {
  var firstName        = req.body.firstName,
      lastName         = req.body.lastName,
      phone            = req.body.phone,
      email            = req.body.email,
      username         = req.body.email,
      password         = req.body.password,
      password_confirm = req.body.password_confirm;

      // Validation
      req.checkBody('firstName', 'First Name is required').notEmpty();
      req.checkBody('lastName', 'Last Name is required').notEmpty();
      req.checkBody('phone', 'Phone number is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      req.checkBody('password', 'Password is required').notEmpty();
      req.checkBody('password_confirm', 'Passwords do not match').equals(req.body.password);
  var errors = req.validationErrors();

  if (errors) {
    // res.render('register', {
    //   errors: errors
    // });
    var output = {
      error_msg: "Something went wrong!",
      errors
    };

    res.send(output);
  } else {
    var newUser = new User({
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      email: email,
      username: username,
      password: password
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });
    var output = {
      success_msg: "You are registered and can now login"
    };
    // req.flash('success_msg', 'You are registered and can now login');
    res.send(output);
    // res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//   User.getUserById(id, function (err, user) {
//     done(err, user);
//   });
// });

router.post('/login', passport.authenticate('local', { session: false }), serialize, generateToken, respond
// function (req, res) {
//   res.send(req.flash());
// }
);

function serialize(req, res, next) {
  console.log('req.user: ', req.user);
  User.create(req.user, function (err, user) {
    if (err) { return next(err); }
    // we store the updated information in req.user again
    req.user = {
      id: user.id
    };
    next();
  });
}

function generateToken(req, res, next) {
  req.token = jwt.sign({
    id: req.user.id,
  }, 'server secret', {
      expiresIn: 604800
    });
  next();
}

function respond(req, res) {
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}

router.get('/logout', function (req, res) {
  req.logout();

  // req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});
module.exports = router;