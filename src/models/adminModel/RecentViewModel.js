import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const NotificationSchema = mongoose.Schema(
  {
    id: Number,
    product_id: {
      type: Number,
      required: true,
    },
    guest_id: {
      type: String,
      default: null,
    },
    product_type: {
      type: String,
      default: null,
    },
    user_id: {
      type: Number,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

NotificationSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("RecentView");
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

const RecentView = mongoose.model("RecentView", NotificationSchema);

export default RecentView;
