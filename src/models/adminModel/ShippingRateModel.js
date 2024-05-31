import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const ShippingRateSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    delivery_takes: {
      type: Number,
      required: true,
    },
    mini_order: {
      type: Number,
      required: true,
    },
    max_order: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    free_shipping: {
      type: Boolean,
      required: true,
    },
    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingZone",
      required: true,
    },
    carrier_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Carrier",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

ShippingRateSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
ShippingRateSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

ShippingRateSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("ShippingRate");
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

const ShippingRate = mongoose.model("ShippingRate", ShippingRateSchema);
export default ShippingRate;
