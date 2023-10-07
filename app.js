require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "this is my secrety",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

// const secretKey = process.env.SECRET
// userSchema.plugin(encrypt, {
//   secret: secretKey,
//   encryptedFields: ["password"],
// });

const userModel = new mongoose.model("User", userSchema);

passport.use(userModel.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const user = new userModel({
      email: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
    // userModel.findOne({ email: req.body.username }).then(function (result) {
    //   bcrypt.compare(
    //     req.body.password,
    //     result.password,
    //     function (err, result) {
    //       if (result === true) {
    //         res.render("secrets");
    //       }
    //     }
    //   );
    // });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    userModel.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, () => {
            // It is local here because we are working on local host
            res.redirect("/secrets");
          });
        }
      }
    );
    // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //   const user = new userModel({
    //     email: req.body.username,
    //     password: hash,
    //   });
    //   user.save().then(function (result) {
    //     if (result) {
    //       res.render("secrets");
    //     }
    //   });
    // });
  });

app.listen(3000, () => {
  console.log("Gotchaa !!!");
});
