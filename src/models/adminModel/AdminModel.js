import mongoose from "mongoose";
import sequence from "mongoose-sequence";


const autoIncrement = sequence(mongoose);

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    status: {
      type: Boolean,
      required: true,
      default: true,
    },

    user_address : {
        type: mongoose.Schema.Types.ObjectId ,
        ref: 'User',
    }
  },
  { timestamps: {},retainNullValues: true }
);

UserSchema.plugin(autoIncrement, { inc_field: "id" });

const User = mongoose.model("User", UserSchema);

export default User;
