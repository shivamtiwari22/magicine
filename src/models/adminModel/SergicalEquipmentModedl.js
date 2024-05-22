import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const SergicalEquipmentSchema = mongoose.Schema(
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
      type: Boolean,
      default: true,
      required: false,
    },
    slug: {
      unique: true,
      type: String,
      required: true,
    },
    gallery_image: {
      type: [],
      default: null,
    },
    hsn_code: {
      type: String,
      default: null,
    },
    marketer: {
      type: mongoose.Schema.Types.Number,
      ref: "Marketer",
      required: true,
    },
    linked_items: {
      type: Array,
      default: null,
    },
    short_description: {
      name: { type: String, required: true, default: "Short Description" },
      status: { type: String, required: true, default: true },
      content: { type: String, default: null },
    },
    description: {
      name: { type: String, required: true, default: "Description" },
      status: { type: String, required: true, default: true },
      content: { type: String, default: null },
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
    delete_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
  },
  { timestamps: {} }
);

SergicalEquipmentSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Sergical_Equipment");
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

const Sergical_Equipment = mongoose.model(
  "Sergical_Equipment",
  SergicalEquipmentSchema
);

export default Sergical_Equipment;
