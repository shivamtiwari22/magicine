import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const BrandSchema = mongoose.Schema(
  {
    id: Number,
    brand_name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    featured_image: {
      type: String,
      default: null,
    },
    short_description: {
      type: String,
      default: null,
    },
    banner_img_center_one: {
      type: String,
      default: null,
    },
    banner_img_center_two: {
      type: String,
      default: null,
    },
    banner_img_center_three: {
      type: String,
      default: null,
    },
    banner_img_center_four: {
      type: String,
      default: null,
    },
    banner_img_center_five: {
      type: String,
      default: null,
    },
    meta_title: {
      type: String,
      default: null,
    },
    meta_description: {
      type: String,
      default: null,
    },
    meta_keywords: {
      type: String,
      default: null,
    },
    og_tag: {
      type: String,
      default: null,
    },
    schema_markup: {
      type: String,
      default: null,
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
    top_deals: {
      type: Array,
      default: null
    }
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

BrandSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
BrandSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

BrandSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Brand");
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

const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;
