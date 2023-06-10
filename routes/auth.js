const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
      isAdmin: req.body.isAdmin,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json("Username or email already exists");
    } else if (err._message && err._message.includes("User validation failed")) {
      res.status(400).json("Missing required fields");
    } else {
      res.status(500).json("Something went wrong");
    }
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong password or username!");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("Wrong password or username!");

    const { password, ...info } = user._doc; 
    res.status(200).json(info);
    
  } catch (err) {
  } 
}); 

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
});
 
module.exports = router; 
