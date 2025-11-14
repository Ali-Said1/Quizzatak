import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
    },
    classrooms: [{ type: Schema.Types.ObjectId, ref: "Classroom" }],
    quizSubmissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
  },
  {
    timestamps: true,
  }
);

const transform = (_, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.passwordHash;
  return ret;
};

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform,
});

userSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
