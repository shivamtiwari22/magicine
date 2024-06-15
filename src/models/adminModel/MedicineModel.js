import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const MoreDetailsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Mixed, default: null },
  status: { type: Boolean, default: true },
});

const MedicineSchema = mongoose.Schema(
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
      type: Array,
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
    has_variant: {
      type: Boolean,
      default: null,
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
      set: (v) =>
        v === null || v === undefined || v === "" || isNaN(v)
          ? null
          : Number(v),
    },
    width: {
      type: Number,
      default: null,
      set: (v) =>
        v === null || v === undefined || v === "" || isNaN(v)
          ? null
          : Number(v),
    },
    height: {
      type: Number,
      default: null,
      set: (v) =>
        v === null || v === undefined || v === "" || isNaN(v)
          ? null
          : Number(v),
    },
    tags: {
      type: Array,
      default: null,
    },
    more_details: {
      type: [MoreDetailsSchema],
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
    packOf: {
      type: Number,
      required: true,
    },
    linked_items: {
      type: Array,
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
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {},
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

MedicineSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
MedicineSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

MedicineSchema.pre("save", async function (next) {
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

const Medicine = mongoose.model("Medicine", MedicineSchema);

export default Medicine;
