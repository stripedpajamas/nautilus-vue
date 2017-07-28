import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: String,
  domain: String,
  defaultCreds: Boolean,
});

export default mongoose.model('Client', ClientSchema);
