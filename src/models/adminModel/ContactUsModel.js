import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const ContactUsSchema = mongoose.Schema(
  {
    id: Number,
    banner_image: {
      type: String,
      default: null,
    },
    email_details: {
      type: String,
      required: true,
    },
    phone_number_one: {
      type: String,
      required: true,
    },
    phone_number_two: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
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
    og_tags: {
      type: String,
      default: null,
    },
    schema_markup: {
      type: String,
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

ContactUsSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
ContactUsSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
ContactUsSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("ContactUs");
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

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
export default ContactUs;
