import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const PrescriptionRequestSchema = mongoose.Schema(
  {
    id: Number,
    medicine_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Medicine",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Medicine",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);



PrescriptionRequestSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("PrescriptionRequest");
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

const PrescriptionRequest = mongoose.model(
  "PrescriptionRequest",
  PrescriptionRequestSchema
);
export default PrescriptionRequest;
