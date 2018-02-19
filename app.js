var express             = require('express'),
    path                = require('path'),
    cookieParser        = require('cookie-parser'),
    bodyParser          = require('body-parser'),
    exphbs              = require('express-handlebars'),
    expressValidator    = require('express-validator'),
    flash               = require('connect-flash'),
    session             = require('express-session'),
    passport            = require('passport'),
    LocalStrategy       = require('passport-local').Strategy,
    mongo               = require('mongodb'),
    mongoose            = require('mongoose');

// Database Connection
mongoose.connect("mongodb://localhost/auth");
var db = mongoose.connection;

// Routes setup
var routes              = require('./routes/index'),
    users               = require('./routes/users');

// Initialize App
var app = express();

// Setting up View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set Static Folder to public
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'Super Secret',
  saveUninitialized: true,
  resave: true
}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Flash Connection
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));
});