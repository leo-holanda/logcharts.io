var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/log_guide", function (req, res, next) {
  res.render("log_guide");
});


module.exports = router;
