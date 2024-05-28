import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const ContactSchema = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact_no : {
         type : String ,
         required : true 
    },
     message : {
          type: String ,
          required: true
     }

  },
  { timestamps: {} }
);

ContactSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Contact");
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

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
