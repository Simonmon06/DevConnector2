const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true, // DeprecationWarning: current Server Discovery and Monitoring engine is deprecated
    }); //since mongoose.connect() returns a promise, we want to wait
    console.log('mongoDB connected');
  } catch (error) {
    console.error(error.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
