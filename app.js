require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secretKey = process.env.SECRET
// userSchema.plugin(encrypt, {
//   secret: secretKey,
//   encryptedFields: ["password"],
// });

const userModel = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    userModel.findOne({ email: req.body.username }).then(function (result) {
      bcrypt.compare(
        req.body.password,
        result.password,
        function (err, result) {
          if (result === true) {
            res.render("secrets");
          }
        }
      );
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const user = new userModel({
        email: req.body.username,
        password: hash,
      });
      user.save().then(function (result) {
        if (result) {
          res.render("secrets");
        }
      });
    });
  });

app.listen(3000, () => {
  console.log("Gotchaa !!!");
});
