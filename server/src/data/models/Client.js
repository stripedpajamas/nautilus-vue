import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: { unique: true },
  },
  domain: {
    type: String,
    required: true,
    index: { unique: true },
  },
  defaultCreds: {
    type: Boolean,
    required: true,
  },
  includeExpireCheck: {
    type: Boolean,
    required: true,
  },
  includeLicenseCheck: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model('Client', ClientSchema);
