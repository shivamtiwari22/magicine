import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const ProductSchema = mongoose.Schema(
  {
    id: Number,
    product_name: {
      type: String,
      required: true,
    },
    featured_image: {
      type: String,
      required: true,
      // default: null,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    slug: {
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
    categories: {
      type: Array,
      default: null,
    },
    has_variant: {
      type: Boolean,
      default: false,
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
    form: {
      type: String,
      default: null,
    },
    packOf: {
      type: Number,
      default: null,
    },
    tags: {
      type: Array,
      default: null,
    },
    long_description: {
      type: String,
      default: null,
    },
    short_description: {
      type: String,
      default: null,
    },
    minimum_order_quantity: {
      type: Number,
      required: true,
    },
    linked_items: {
      type: [],
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
    type: {
      type: String,
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

ProductSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
ProductSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

ProductSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("product");
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

const Product = mongoose.model("Product", ProductSchema);

export default Product;
