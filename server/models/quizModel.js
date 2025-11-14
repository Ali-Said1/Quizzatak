import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: [(val) => val.length >= 2, "At least two options required"],
      required: true,
    },
    correct: { type: Number, default: 0 },
    timer: { type: Number, default: 10 },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizSubmissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
    questions: [questionSchema],
  },
  { timestamps: true }
);

const transform = (_, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

quizSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform,
});

quizSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform,
});

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

export default Quiz;
