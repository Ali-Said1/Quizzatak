import mongoose from "mongoose";

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    answerIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
    timeSpent: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  { _id: false }
);

const submissionSchema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: "GameSession",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    answers: { type: [answerSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
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

submissionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform,
});

submissionSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform,
});

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

export default Submission;
