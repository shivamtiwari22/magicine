import moment from "moment";
import mongoose from "mongoose";
import sequence from "mongoose-sequence";

const autoIncrement = sequence(mongoose);

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null 
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      null: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: false,
      default: null,
    },
    profile_pic: {
      type: String,
      required: false,
      default: null,
    },
    gender : {
        type:String ,
        required:false ,
        default :null ,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    otp : {
       type: Number ,
       default: null 
    }
,
    user_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null 
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
// UserSchema.path("createdAt").get(function (value) {
//   return value ? moment(value).format("DD-MM-YYYY") : null;
// });
UserSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
UserSchema.path("dob").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

UserSchema.plugin(autoIncrement, { inc_field: "id" });

const User = mongoose.model("User", UserSchema);

export default User;
