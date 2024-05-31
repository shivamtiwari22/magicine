import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";
// const autoIncrement = sequence(mongoose);

const TagsSchema = mongoose.Schema(
  {
    id: Number,
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    link: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

TagsSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
TagsSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

TagsSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Tags");
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

const Tags = mongoose.model("Tags", TagsSchema);

export default Tags;
