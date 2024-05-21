import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const MoreDetailsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Mixed, required: true },
  active: { type: Boolean, required: true },
});

const MedicineSchima = mongoose.Schema(
  {
    id: Number,
    product_name: {
      type: String,
      required: true,
      unique: true,
    },
    featured_image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "draft"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    gallery_image: {
      type: [],
      default: null,
    },
    hsc_code: {
      type: String,
      default: null,
    },
    generic_name: {
      type: String,
      required: true,
    },
    componsition: {
      type: String,
      required: true,
    },
    strength: {
      type: Number,
      required: true,
    },
    storage: {
      type: String,
      required: true,
    },
    form: {
      type: String,
      required: true,
    },
    has_varient: {
      type: Boolean,
      default: null,
    },
    prescription_required: {
      type: Boolean,
      default: null,
    },
    indication: {
      type: String,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    marketer: {
      type: mongoose.Schema.Types.Number,
      ref: "Marketer",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.Number,
      ref: "Brand",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    tags: {
      type: Array,
      default: null,
    },
    more_details: [MoreDetailsSchema],
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
  },
  { timestamps: {}, retainNullValues: true }
);
MedicineSchima.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Medicine");
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

const Medicine = mongoose.model("Medicine", MedicineSchima);

export default Medicine;
