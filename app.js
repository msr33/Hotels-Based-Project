
if (process.env.NODE_ENV != "production"){
    require("dotenv").config();
};
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user.js");       
const LocalStrategy = require("passport-local");


const dbUrl = process.env.ATLASDB_URL;

/*
const Review = require("./models/review.js")
const {reviewSchema} = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
*/

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine('ejs', ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET,   
    },
    touchAfter: 24*3600,
  });

  store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
  });

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => console.log(err));


async function main() {
  await mongoose.connect(dbUrl);
}

/*
app.get("/testlisting", async (req, res) => {
    let samplelisting = new Listing({
        title: "My new Taj Mahal",
        description: "Love",
        price: 100000000000000000,
        location: "Agra",
        country: "India",
    });

    await samplelisting.save();
    console.log("sample was saved");
    res.send("succesfully testing done")

});
*/



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});


app.use("/", listings);
app.use("/", reviews);
app.use("/", users);

/*
app.all("*", (req, res, next()) => {
    next(new ExpressError(404, "page not found"));
});
*/

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
