const mongoose = require("mongoose");
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
      })
      .then((result) => {
        console.log("DB Connection Successful");
      })
      .catch((err) => console.log(err));
  }
}

module.exports = new Database();
