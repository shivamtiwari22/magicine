import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const SubscriberSchema = mongoose.Schema(
  {
    id: Number,
    email: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

SubscriberSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
SubscriberSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

SubscriberSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Subscriber");
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

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);
export default Subscriber;
