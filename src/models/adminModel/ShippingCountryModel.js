import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const ShippingCountrySchema = mongoose.Schema(
  {
    id: Number,
    country_name: {
      type: String,
      required: true,
    },
    states : {
         type:Array,
         default:null
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingZone",
      required: true,
    },
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

  },
  { timestamps: {} }
);

ShippingCountrySchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("ShippingCountry");
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

const ShippingCountry = mongoose.model("ShippingCountry", ShippingCountrySchema);
export default ShippingCountry;
