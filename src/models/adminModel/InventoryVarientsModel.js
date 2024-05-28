import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

// const ItemReferenceSchema = new mongoose.Schema({

// });
const VariantDataSchema = new mongoose.Schema({
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
  stock: {
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
});

const VarientSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
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
    data: {
      type: [VariantDataSchema],
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
    timestamps: true,
    retainNullValues: true,
  }
);

VarientSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Varient");
  }
  next();
});

async function getNextSequenceValue(modelName) {
  const sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
}

const Varient = mongoose.model("Varient", VarientSchema);

export default Varient;
