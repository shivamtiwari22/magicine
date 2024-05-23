import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const MoreDetailsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Mixed, default: null },
  status: { type: Boolean, required: true },
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
      default: null,
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
    hsn_code: {
      type: String,
      default: null,
    },
    generic_name: {
      type: String,
      required: true,
    },
    composition: {
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
      default: false,
    },
    prescription_required: {
      type: Boolean,
      default: false,
    },
    indication: {
      type: String,
      required: true,
    },
    category: {
      type: [],
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
    more_details: {
      type: [MoreDetailsSchema],
      default: null,
      // required: false,
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
    packOf: {
      type: Number,
      required: true,
    },
    linked_items: {
      type: [Number],
      default: null,
    },
    minimum_order_quantity: {
      type: Number,
      required: true,
    },
    short_description: {
      type: String,
      default: null,
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
