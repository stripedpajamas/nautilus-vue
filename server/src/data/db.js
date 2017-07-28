import mongoose from 'mongoose';

mongoose.Promise = Promise;

export default uri => mongoose.connect(uri, { useMongoClient: true })
  .then(() => {
    console.log('Connected to MongoDB at', uri);
    return mongoose.connection;
  });
