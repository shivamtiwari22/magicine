import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";
import moment from "moment";

const NotificationSchema = mongoose.Schema(
  {
    id: Number,
    to: {
      type: Array,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    schedule: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: "sent",
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


NotificationSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("PushNotification");
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

const PushNotification = mongoose.model("PushNotification", NotificationSchema);

export default PushNotification;
