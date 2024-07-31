import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const MyPrescriptionSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      require: true,
    },
    status: {
      type: Boolean,
      default: true,
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
    this.id = await getNextSequenceValue("NotFoundSearch");
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

const NotFoundSearch = mongoose.model("NotFoundSearch", MyPrescriptionSchema);
export default NotFoundSearch;
