const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
// const verify = require("../verifyToken");

//UPDATE
// router.put("/:id", async (req, res) => {
//   // const token = req.cookies.accessToken;
//   // if (!token) return res.status(401).json("Not authenticated!");

//   // jwt.verify(token, "secretkey", async (err, userInfo) => {
//     // if (err) return res.status(403).json("Token is not valid!");

//     // if (req.user.id === req.params.id || req.user.isAdmin) {
//       if (req.body.password) {
//         req.body.password = CryptoJS.AES.encrypt(
//           req.body.password,
//           process.env.SECRET_KEY
//         ).toString();
//       }

//       try {
//         const updatedUser = await User.findByIdAndUpdate(
//           req.params.id,
//           {
//             $set: req.body,
//           },
//           { new: true }
//         );
//         res.status(200).json(updatedUser);
//       } catch (err) {
//         // res.status(500).json(err);
//       }
//   //   } else {
//   //     res.status(403).json("You can update only your account!");
//   //   }
//   // });
// });
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json("User not found");
    }

    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    // Check if the updated username already exists
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json("Username already exists");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json("An error occurred");
  }
});


//DELETE
router.delete("/:id",  async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    if (req.user.id === req.params.id || req.user.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You can delete only your account!");
    }});
});

//GET
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", async (req, res) => {
  // const token = req.cookies.accessToken;
  // if (!token) return res.status(401).json("Not authenticated!");

  // jwt.verify(token, "secretkey", async(err, userInfo) => {
  //   if (err) return res.status(403).json("Token is not valid!");
    const query = req.query.new;
    // if (req.user.isAdmin) {
      try {
        const users = query
          ? await User.find().sort({ _id: -1 }).limit(5)
          : await User.find();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json(err);
      }
    // } else {
      // res.status(403).json("You are not allowed to see all users!");
    // }
  // });
});

//GET USER STATS 
router.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
