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
      default: "active",
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
    more_details: {
      type: [
        {
          description: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          uses: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          benefits: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          side_effect: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          how_to_use: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          how_it_work: String,
          status: Boolean,
          data: { type: String, default: null },
        },
        {
          faq:String,
          status: Boolean,
          // data: { type: mongoose.Schema.Types.Mixed, default: null },
        },
        {
          safety_advice: {
            alcohol: {
              reason: String,
              option: String,
            },
            pregnancy: {
              reason: String,
              option: String,
            },
            breastfeeding: {
              reason: String,
              option: String,
            },
            driving: {
              reason: String,
              option: String,
            },
            kidney: {
              reason: String,
              option: String,
            },
            liver: {
              reason: String,
              option: String,
            },
          },
          status: Boolean,
          data: { type: mongoose.Schema.Types.Mixed, default: null },
        },
        {
          missed_doses: String,
          status: Boolean,
          data: { type: mongoose.Schema.Types.Mixed, default: null },
        },
        {
          quicktips: String,
          status: Boolean,
          data: { type: mongoose.Schema.Types.Mixed, default: null },
        },
      ],
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
  },
  { Timestamp: {} }
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
