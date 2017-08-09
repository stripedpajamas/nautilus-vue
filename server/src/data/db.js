import mongoose from 'mongoose';

mongoose.Promise = Promise;

export default uri => mongoose.connect(uri, { useMongoClient: true })
  .then(() => mongoose.connection);
