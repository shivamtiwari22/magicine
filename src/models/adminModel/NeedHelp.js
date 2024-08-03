import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const NeedHelpModel = mongoose.Schema({
    id: Number,
    orderId: {
        type: Number,
        required: true
    },
    files: {
        type: String,
        default: null,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed", "pending"],
        default: "open"
    },
    created_by: {
        type: mongoose.Schema.Types.Number,
        ref: "User",
        required: true
    }
}, {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
})


NeedHelpModel.path("createdAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});
NeedHelpModel.path("updatedAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});

NeedHelpModel.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("NeedHelp");
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


const NeedHelp = mongoose.model("NeedHelp", NeedHelpModel)


export default NeedHelp;