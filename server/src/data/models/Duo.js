import mongoose from 'mongoose';

const DuoSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: { unique: true },
  },
  data: {
    ikey: {
      type: String,
      required: true,
    },
    skey: {
      type: String,
      required: true,
    },
    api: {
      type: String,
      required: true,
    },
    akey: {
      type: String,
      required: true,
    },
  },
});

export default mongoose.model('Duo', DuoSchema);
