import moment from "moment";
import mongoose from "mongoose";
import SequenceModel from "../sequence.js";



const ApplicationSchema = mongoose.Schema(
  {

    id : Number,
    name: {
      type: String,
      default: null 
    },
    position_id: {
      type: Number,
      required: true,
    },
    contact_no: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      null: true,
    },
    resume: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {},
  }
);


ApplicationSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Application");
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

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
