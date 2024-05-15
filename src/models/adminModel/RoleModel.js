import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import User from "./AdminModel.js";
import SequenceModel from "../sequence.js";
const autoIncrement = sequence(mongoose);

const RolesSchema = mongoose.Schema({
  id: Number,
  user_id: {
    type: mongoose.Schema.Types.Number,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

RolesSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Roles");

    console.log("Assigned id:", this.id);
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

// RolesSchema.plugin(autoIncrement);

const Roles = mongoose.model("Roles", RolesSchema);

export default Roles;
