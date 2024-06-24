import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const InvertoryWithoutVarientSchema = new mongoose.Schema(
  {
    id: Number,

    itemType: {
      type: String,
      required: true,
      enum: ["Product", "Medicine", "Equipment"],
    },
    itemId: {
      type: mongoose.Schema.Types.Number,
      required: true,
      refPath: "itemType",
    },

    created_by: {
      type: mongoose.Schema.Types.Number,
      required: true,
      ref: "User",
    },
    sku: {
      type: String,
      required: true,
    },
    stock_quantity: {
      type: Number,
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
    discount_percent: {
      type: Number,
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

InvertoryWithoutVarientSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
InvertoryWithoutVarientSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

InvertoryWithoutVarientSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("InvertoryWithoutVarient");
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

const InvertoryWithoutVarient = mongoose.model(
  "InvertoryWithoutVarient",
  InvertoryWithoutVarientSchema
);
export default InvertoryWithoutVarient;
