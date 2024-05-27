import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import ShippingCountry from "./ShippingCountryModel.js";

const ShippingZoneSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: 1,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
  },
  { timestamps: {} }
);

ShippingZoneSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("ShippingZone");
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


// Middleware to delete associated ShippingCountry documents when a ShippingZone is deleted
ShippingZoneSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
      await ShippingCountry.deleteMany({ zone: this._id });
      next();
  } catch (error) {
      next(error);
  }
});

const ShippingZone = mongoose.model("ShippingZone", ShippingZoneSchema);
export default ShippingZone;
