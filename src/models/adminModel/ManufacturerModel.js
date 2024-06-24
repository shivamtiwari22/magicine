import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const MarketerSchema = mongoose.Schema(
  {
    id: Number,
    manufacturer_name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: null
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

MarketerSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
MarketerSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

MarketerSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Category");
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

const Marketer = mongoose.model("Marketer", MarketerSchema);

export default Marketer;
