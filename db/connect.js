import mongoose from 'mongoose';

//You do not need the deprecation warning handling for v^6
const connectDb = (url) => {
  //returns a promise
  return mongoose.connect(url);
};

export default connectDb;
