const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");
const dataOperationsRoute = require("./routes/dataTracking");
const cors= require("cors");
const cookieParser= require("cookie-parser");
const PORT= process.env.PORT;

  mongoose 
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("DB Connection Successfull"))
    .catch((err) => {
      console.error(err); 
  }); 

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true); //allow for cookies to be used
    next();
  });
  app.use(express.json());
  app.use(
    cors({ //Only allow localhost:3000 to access this api
      origin: ["http://localhost:3000", "http://localhost:4000"],
    })
  );
  app.use(cookieParser()); 

  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/movies", movieRoute); 
  app.use("/api/lists", listRoute); 
  app.use("/api/dataOperations", dataOperationsRoute); 

  app.listen(PORT, () => {
  console.log("Backend server is running on port: "+ PORT +"!");
});
