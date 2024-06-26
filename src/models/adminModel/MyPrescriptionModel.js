import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const MyPrescriptionSchema = mongoose.Schema(
  {
    id: Number,
    medicine_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Medicine",
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    file: {
      type: String,
       default: null,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

MyPrescriptionSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
MyPrescriptionSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

MyPrescriptionSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("MyPrescription");
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

const MyPrescription = mongoose.model(
  "MyPrescription",
  MyPrescriptionSchema
);
export default MyPrescription;
