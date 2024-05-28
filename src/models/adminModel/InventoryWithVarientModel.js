import mongoose from "mongoose";
import SequenceModel from "../../src/models/sequence";

const InventoryWithVarientModel = mongoose.Schema(
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
    data: {
      type: [
        {
          variant: {
            type: String,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
          sku: {
            type: String,
            required: true,
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
        },
      ],
      required: true,
    },
    attribute: {
      type: mongoose.Schema.Types.Number,
      ref: "CustomFiled",
      required: true,
    },
    attribute_value: {
      type: mongoose.Schema.Types.Number,
      ref: "CustomFiledValue",
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
