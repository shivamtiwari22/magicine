import mongoose from "mongoose";
import sequence from "mongoose-sequence";
import SequenceModel from "../sequence.js";



const CustomFieldSchema = mongoose.Schema({
    id: Number ,
    attribute_type: {
        type: String,
        required: true
    },
    attribute_name: {
        type: String,
        required: true
    },
    list_order: {
        type: Number,
        required: true
    },
    category_id: {
        type: Array,
        ref: 'Category',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deleted_at: {
        type: Date,
        default: null
    } ,
    value_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomFieldValue',
    },
} , {
    timestamps: {}, retainNullValues: true 
});




CustomFieldSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("CustomFiled");
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


const CustomFiled = mongoose.model('CustomFiled', CustomFieldSchema);

export default CustomFiled ;
