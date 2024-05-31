import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const VariantSchema = new mongoose.Schema(
  {
    variant: {
      type: Array,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    selling_price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
    },
    attribute: {
      type: Array,
      required: true,
    },
    attribute_value: {
      type: Array,
      required: true,
    },
  },
  { _id: false }
);

const InventoryWithVarientModel = new mongoose.Schema(
  {
    id: Number,
    modelType: {
      type: String,
      required: true,
      enum: ["Product", "Medicine"],
    },
    modelId: {
      type: mongoose.Schema.Types.Number,
      required: true,
      refPath: "modelType",
    },
    variants: [VariantSchema],
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
    timestamps: true,
    retainNullValues: true,
  }
);

InventoryWithVarientModel.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("InventoryWithVarient");
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

const InventoryWithVarient = mongoose.model(
  "InventoryWithVarient",
  InventoryWithVarientModel
);

export default InventoryWithVarient;
