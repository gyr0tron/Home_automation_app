var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")

mongoose.connect("mongodb://localhost/auth");

var app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
  secret: "Best Security Secret Goes Here!",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/secret", isLoggedIn, function (req, res) {
  res.render("secret");
});

//AUTH ROUTES
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  console.log(req);
  User.register(new User({
    userdata: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.username
    },
    username: req.body.username
  }), req.body.password, function(err, user){
    if(err) {
      console.log(err);
      return res.render('register');
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secret");
    });
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res) {
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(3000, function(){
  console.log("Server started!!!");
});