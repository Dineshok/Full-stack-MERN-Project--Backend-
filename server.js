const Express = require("express");
const app = Express();
const Mongoose = require("mongoose");
const CORS = require("cors"); //Using this other applications running in other port numbers
//can connect to this application
const bcrypt = require("bcrypt");

const RazorPay = require("razorpay"); //For Dummy Payment

app.use(CORS());
app.use(Express.json());

Mongoose.connect(
  "mongodb+srv://dinesh:dinesh@cluster0.lm20tc4.mongodb.net/moviesdatabase?retryWrites=true&w=majority&appName=Cluster0"
);

const MoviesSchema = new Mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  movie_name: {
    type: String,
    unique: true,
  },
  image_url: {
    type: String,
  },
  description: {
    type: String,
  },
  genre: {
    type: String,
  },
  censor: {
    type: String,
  },
  director: {
    type: String,
  },
  cast: {
    type: [String],
  },
});

const MoviesModel = Mongoose.model("moviescollections", MoviesSchema);

app.get("/fetch/movies/all", async (req, res) => {
  MoviesModel.find().then((output) => {
    res.json(output);
  });
});

const signupSchema = new Mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const SignUpModel = Mongoose.model("signups", signupSchema);

app.post("/signup", async (req, res) => {
  const { myname, myemail, mypassword } = req.body;

  const hashedPassword = await bcrypt.hash(mypassword, 10);

  const existingUser = await SignUpModel.findOne({ email: myemail });
  if (existingUser)
    return res.status(400).json({ message: "User Already Exists" });
  else {
    const newUser = new SignUpModel({
      name: myname,
      email: myemail,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({ message: "Registration Successful" });
  }
});

app.post("/signin", async (req, res) => {
  const { enteredEmail, enteredPassword } = req.body;

  const result = await SignUpModel.findOne({ email: enteredEmail });
  if (result) {
    const actualPassword = result.password;
    const passwordMatch = await bcrypt.compare(enteredPassword, actualPassword);
    if (passwordMatch) {
      return res.status(201).json({ message: "Loged In Successfully" });
    } else {
      return res.status(400).json({ message: "Password Doesnot Match" });
    }
  } else {
    return res.status(400).json({
      message: "No account found with this email. Please sign up first.",
    });
  }
});

//For Theater Cities and Shows
const theatreSchema = new Mongoose.Schema({
  theatreName: String,
  showTimes: Array,
});

const cityAndTheatresSchema = new Mongoose.Schema({
  city: String,
  theatres: [theatreSchema],
});

const CityAndTheatresModel = Mongoose.model(
  "cityandtheatres",
  cityAndTheatresSchema
);

app.get("/bookingdetails", async (req, res) => {
  const bookingdetails = await CityAndTheatresModel.find();

  res.json({ bookingdetails });
});

const razorpayDetails = new RazorPay({
  key_id: "rzp_test_SE61Bb5xwfvQqP",
  key_secret: "WG2JQ5SDjtSSc0PrGBzLH6Gh",
});

app.post("/create/order", (req, res) => {
  const amountToBePaid = req.body.amount;

  const details = {
    amount: amountToBePaid * 100,
    currency: "INR",
  };

  razorpayDetails.orders.create(details, (error, orderInfo) => {
    if (!error) res.json({ orderInfo });
  });
});

app.listen(9000, () => {
  console.log("The Express Server is running on port 9000");
});
