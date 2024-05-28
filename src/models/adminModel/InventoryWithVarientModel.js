import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const ItemReferenceSchema = new mongoose.Schema({
  itemType: {
    type: String,
    required: true,
    enum: ["Product", "Medicine"],
  },
  itemId: {
    type: mongoose.Schema.Types.Number,
    required: true,
    refPath: "itemType",
  },
});

const inventoryWithVarientSchema = mongoose.Schema(
  {
    id: Number,
    item: {
      type: ItemReferenceSchema,
      required: true,
    },
    strength: {
      type: Number,
      required: true,
    },
    size: {
      type: Array,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
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
  }
);

inventoryWithVarientSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("InvertoryWithVarient");
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

const InvertoryWithVarient = mongoose.model(
  "InvertoryWithVarient",
  inventoryWithVarientSchema
);
export default InvertoryWithVarient;
