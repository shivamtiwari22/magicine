import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const PrivacyPolicySchema = mongoose.Schema(
  {
    id: Number,
    page_title: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    banner_image: {
      type: String,
      default: null,
    },
    video: {
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
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

PrivacyPolicySchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
PrivacyPolicySchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

PrivacyPolicySchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Privacy policy");
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

const Privacy_policy = mongoose.model("Privacy_policy", PrivacyPolicySchema);

export default Privacy_policy;
