const router = require("express").Router();
const Operations = require("../models/Data");
const mongoose = require('mongoose');

router.post("/", async (req, res) => {
    // if (req.user.isAdmin) {
    
    const today = new Date().toISOString().split('T')[0]; // Get today's date in the format "YYYY-MM-DD"
    const existingData = await Operations.findOne({ date: today });
    const requestData = {
      date: today,
      upload: req.body.upload,
      download: req.body.download,
      fileSize: req.body.fileSize
    };

    if (existingData) {
      try {
        const updatedData = await Operations.findByIdAndUpdate(
          existingData._id,
          {
            $set: requestData,
          },
          { new: true }
        );
        res.status(200).json(updatedData);
      } catch (err) {
        res.status(500).json(err);
      }
    }
    else{
      try {
        await Operations.deleteMany(); // Delete all previous data
        const newData = new Operations(requestData);
        const savedData = await newData.save();
        res.status(201).json(savedData);
      } 
      catch (err) {
        console.error(err);
        if (err.code === 11000) { // check if the error code is 11000, which means duplicate key error
          res.status(409).json({ message: "A movie with this title already exists. Please choose a different title." }); // send a 409 conflict status and a custom message
        } else {
          res.status(500).json(err); // otherwise, send a 500 internal server error and the original error object
        }
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
        const updatedData = await Operations.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedData);
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
        await Operations.findByIdAndDelete(req.params.id);
        res.status(200).json("The operation data has been deleted!");
      } catch (err) {
        res.status(500).json(err);
      }
    // } else {
    //   res.status(403).json("You are not allowed!");
    // }
});
  
  //GET
router.get("/find/", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in the format "YYYY-MM-DD"
    const existingData = await Operations.findOne({ date: today });
    // const data = await Operations.findById(req.params.id);
    res.status(200).json(existingData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/mongoDBStorageSize', async (req, res) => {
  try {
    const connection = mongoose.connection;
    const dbNames = await connection.db.admin().listDatabases();
    let totalDataSize = 0;
    let totalStorageSize = 0;

    const filteredDbNames = dbNames.databases.filter(dbName => dbName.name !== 'local');

    for (let dbName of filteredDbNames ) {
      let stats = await connection.db.admin().command({ dbStats: 1, scale: 1024 }, { dbName: dbName.name });
      totalDataSize += stats.dataSize;
      totalStorageSize += stats.storageSize;
      console.log("Name", dbName.name)
      console.log("data", stats.dataSize)
      console.log("storage", stats.storageSize)
    }
    const response ={
      dataSize: totalDataSize,
      storageSize: totalStorageSize,
    };
    
    res.status(200).json(response); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while retrieving the storage size.' });
  }
});

module.exports = router;