import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";


const FormModel = mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.Number,
        ref: "User"
    },
    deleted_at: {
        type: Date,
        default: null
    }
},
    {
        timestamps: {},
        retainNullValues: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


FormModel.path("createdAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});
FormModel.path("updatedAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});

FormModel.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Form");
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

const Form = mongoose.model("Form", FormModel)

export default Form