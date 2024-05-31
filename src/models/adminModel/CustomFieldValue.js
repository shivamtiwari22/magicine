import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";

const CustomFieldValueSchema = mongoose.Schema(
  {
    id: Number,
    attribute_name: {
      type: String,
      required: true,
    },
    list_order: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: null,
    },
    custom_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomField",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

CustomFieldValueSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CustomFieldValueSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CustomFieldValueSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("CustomFiledValue");
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

const CustomFiledValue = mongoose.model(
  "CustomFiledValue",
  CustomFieldValueSchema
);

export default CustomFiledValue;
