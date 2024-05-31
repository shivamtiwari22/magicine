import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CountrySchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: null,
    },
    dial_code: {
      type: String,
      default: null,
    },
    states: { type: Array, default: null },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

CountrySchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CountrySchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CountrySchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Country");
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

const Country = mongoose.model("Country", CountrySchema);
export default Country;
