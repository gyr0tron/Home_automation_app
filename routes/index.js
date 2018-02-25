
var express = require('express');
var router = express.Router();
const expressJwt = require('express-jwt');
const authenticate = expressJwt({ secret: 'server secret' });
// Get Homepage
router.post('/', authenticate, function (req, res) {
  // res.render('index');
  res.status(200).json(req.user);
});

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   } else {
//     var output = {
//       error_msg: "You are not logged in",
//     };
//     res.send(output);
//     // res.redirect('/users/login');
//   }
// }

module.exports = router;