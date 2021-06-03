const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log("DB Connection Successful");
  })
  .catch((err) => console.log(err));
