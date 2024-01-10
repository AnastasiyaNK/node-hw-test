const app = require("./app");
const mongoose = require("mongoose");

const DB_HOST = process.env.DB_HOST;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
