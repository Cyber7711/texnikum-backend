const { red, blue, bgGreen } = require("colors");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Mongo ulandi".red);
  } catch (error) {
    console.error("Mongo ulanishida xatolik", error.message, bgGreen);
    process.exit(1);
  }
};

module.exports = connectDB;
