import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CarrierSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    tracking_url: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      default: null,
      ref: "User",
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

CarrierSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CarrierSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CarrierSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Carrier");
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

const Carrier = mongoose.model("Carrier", CarrierSchema);
export default Carrier;
