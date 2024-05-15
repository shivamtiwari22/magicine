import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const MarketerSchema = mongoose.Schema(
  {
    id: Number,
    manufacturer_name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: {}, retainNullValues: true }
);

MarketerSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Category");
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

const Marketer = mongoose.model("Marketer", MarketerSchema);

export default Marketer;
