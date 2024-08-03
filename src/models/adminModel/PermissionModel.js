import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const NeedHelpModel = mongoose.Schema({
    id: Number,
    user_id: {
        type: Number,
        required: true
    },
    model: {
        type: String,
        default: null,
    },
    Permission: {
        type: Array,
        required: true,
    },
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
        this.id = await getNextSequenceValue("Permission");
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


const Permission = mongoose.model("Permission", NeedHelpModel)


export default Permission;