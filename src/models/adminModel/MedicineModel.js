import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

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
    mare_data: {
      default: null,
      type: [
        {
          name: { type: String, default: "Description", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          name: { type: String, default: "Uses", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          name: { type: String, default: "Benefits", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          name: { type: String, default: "How to use", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          default: "FAQ's",
          name: { type: String, default: "FAQ's", null: true },
          status: { type: Boolean, default: false },
          data: {
            type: [
              {
                question: { type: String, default: null },
                answer: { type: String, default: null },
              },
            ],
            default: null,
          },
        },
        ,
        {
          name: { type: String, default: "How it works", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          name: { type: String, default: "Missed Doses", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
        {
          default: "Safety Advice",
          name: { type: String, default: "Safety Advice", null: true },
          status: { type: Boolean, default: false },
          data: {
            type: {
              alcohol: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
              pregnancy: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
              breast_feading: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
              driving: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
              kidney: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
              liver: {
                reason: { type: String, default: null },
                option: { type: String, default: null },
                default: null,
              },
            },
            default: null,
          },
        },
        {
          name: { type: String, default: "Quick Tips", null: true },
          status: { type: Boolean, default: false },
          data: { type: String, default: null },
        },
      ],
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
    deleted_at:{
      type: Date,
      default: null,
    },
    created_by:{
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required:true
    }
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
