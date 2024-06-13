import moment from "moment";
import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const PositionSchema = mongoose.Schema(
  {
    id: Number,
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    requirement: {
      type: String,
      default: null,
    },

    no_positions: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      null: true,
    },
    work_type: {
      type: String,
      default: null,
    },
    experience: {
      type: String,
      default: null,
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
  },
  {
    timestamps: {},
  }
);

PositionSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Position");
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

const Position = mongoose.model("Position", PositionSchema);

export default Position;
