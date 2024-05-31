import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const SocialMediaSchema = mongoose.Schema({
  media_name: { type: String, required: true },
  logo: { type: String, default: null },
  link: { type: String, default: null },
});

const GlobalSchema = mongoose.Schema(
  {
    id: Number,
    alt_phone: { type: Number, default: null },
    android_app_url: { type: String, default: null },
    copy_right_text: { type: String, required: true },
    email: { type: String, required: true },
    facebook_pixel: { type: String, required: true },
    google_analytics_id: { type: Number, required: true },
    google_tag_manager: { type: String, required: true },
    icon_image: { type: String, default: null },
    iphone_app_url: { type: String, default: null },
    logo: { type: String, default: null },
    marketplace_name: { type: String, default: null },
    meta_description: { type: String, default: null },
    meta_keywords: { type: String, default: null },
    meta_title: { type: String, default: null },
    og_tag: { type: String, default: null },
    phone: { type: Number, required: true },
    schema_markup: { type: String, default: null },
    search_console: { type: String, required: true },
    socialMedia: [SocialMediaSchema],
    whatsapp_link: { type: String, default: null },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
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

GlobalSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
GlobalSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

GlobalSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Global");
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

const Global = mongoose.model("Global", GlobalSchema);

export default Global;
