import mongoose from "mongoose";

const { Schema } = mongoose;

const classroomStudentSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
  },
  { _id: false }
);

const classroomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    joinCode: { type: String, required: true, unique: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentIds: [classroomStudentSchema],
    quizIds: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
  },
  {
    timestamps: true,
  }
);

const transform = (_, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

classroomSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform,
});

classroomSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform,
});

const Classroom =
  mongoose.models.Classroom || mongoose.model("Classroom", classroomSchema);

export default Classroom;
