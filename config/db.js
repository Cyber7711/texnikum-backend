const { red } = require("colors");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongo ulandi".green);
  } catch (error) {
    console.error("Mongo ulanishida xatolik", error.message, red);
    process.exit(1);
  }
};

module.exports = connectDB;
