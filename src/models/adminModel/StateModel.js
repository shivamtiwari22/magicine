import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const StateSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },

  },
  { timestamps: {} }
);

StateSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("State");
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

const State = mongoose.model("State", StateSchema);
export default State;
