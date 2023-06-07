const router = require("express").Router();
const Movie = require("../models/Movie");
// const verify = require("../verifyToken");

//CREATE
router.post("/", async (req, res) => {
  // if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);
    try {
      const savedMovie = await newMovie.save();
      res.status(201).json(savedMovie);
    } catch (err) {
      console.error(err);
      if (err.code === 11000) { // check if the error code is 11000, which means duplicate key error
        res.status(409).json({ message: "A movie with this title already exists. Please choose a different title." }); // send a 409 conflict status and a custom message
      } else {
        res.status(500).json(err); // otherwise, send a 500 internal server error and the original error object
      }
    }
  // } else {
  //   res.status(403).json("You are not allowed!");
  // }
});

//UPDATE
router.put("/:id", async (req, res) => {
  // if (req.user.isAdmin) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedMovie);
    } catch (err) {
      res.status(500).json(err);
    }
  // } else {
  //   res.status(403).json("You are not allowed!");
  // }
});

//DELETE
router.delete("/:id", async (req, res) => {
  // if (req.user.isAdmin) {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("The movie has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  // } else {
  //   res.status(403).json("You are not allowed!");
  // }
});

//GET
router.get("/find/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET RANDOM
router.get("/random", async (req, res) => {
  const type = req.query.type;
  let movie;
  try {
    if (type === "series") {
      movie = await Movie.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      movie = await Movie.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", async (req, res) => {
  // if (req.user.isAdmin) {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies.reverse());
    } catch (err) {
      res.status(500).json(err);
    }
  // } else {
  //   res.status(403).json("You are not allowed!");
  // }
});

module.exports = router; 
