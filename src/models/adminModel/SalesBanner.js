import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const SalesBannerSchema = mongoose.Schema(
  {
    id: Number,
    banner_image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      default: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

SalesBannerSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
SalesBannerSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

SalesBannerSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("SalesBanner");
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

const SalesBanner = mongoose.model("SalesBanner", SalesBannerSchema);

export default SalesBanner;
