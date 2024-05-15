import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const MedicineSchima = mongoose.Schema({
  id: Number,
  product_name: {
    type: String,
    required: true,
  },
  featured_image: {
    type: String,
    required: true,
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
    type: [{}],
    default:null
  },
});
