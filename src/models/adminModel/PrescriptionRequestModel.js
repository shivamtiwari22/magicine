import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

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

PrescriptionRequestSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
PrescriptionRequestSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

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
