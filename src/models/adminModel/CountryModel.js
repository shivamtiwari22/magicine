import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

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
      default:null
    
    },
    states: { type: Array,  default: null },

  },
  { timestamps: {} }
);

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
