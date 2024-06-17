import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";
import moment from "moment";
// const autoIncrement = sequence(mongoose);

const UserAddressSchema = mongoose.Schema(
  {
    id: Number,
    address_line_one: {
      type: String,
      // required: true,
      default: null,
    },
    address_line_two: {
      type: String,
    },
    city: {
      type: String,
      // required: true,
      default: null,
    },
    state: {
      type: String,
      // required: true,
      default: null,
    },
    country: {
      type: String,
      // required: true,
      default: null,
    },
    postal_code: {
      type: String,
      // required: true,
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

UserAddressSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
UserAddressSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
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
const UserAddress = mongoose.model("UserAddress", UserAddressSchema);

export default UserAddress;
