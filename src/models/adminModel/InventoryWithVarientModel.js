import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const InventoryWithVarientModel = new mongoose.Schema(
  {
    id: Number,
    modelType: {
      type: String,
      required: true,
      enum: ["Product", "Medicine","Surgical"],
    },
    modelId: {
      type: mongoose.Schema.Types.Number,
      required: true,
      refPath: "modelType",
    },
    variant: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      // required: true,
      default: null,
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
      default: null,
    },
    attribute_value: {
      type: Array,
      default: null,
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
    discount_percent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

InventoryWithVarientModel.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
InventoryWithVarientModel.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

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
