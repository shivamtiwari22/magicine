import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";
// const autoIncrement = sequence(mongoose);

const UserAddressSchema = mongoose.Schema({
    id: Number ,
    address_line_one: {
        type: String,
        required: true
    },
    address_line_two: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: {}, retainNullValues: true 
});


UserAddressSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("UserAddress");
  }
  next();
});

async function getNextSequenceValue(modelName) {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
}

// Create UserAddress model
const UserAddress = mongoose.model('UserAddress', UserAddressSchema);

export default UserAddress;
