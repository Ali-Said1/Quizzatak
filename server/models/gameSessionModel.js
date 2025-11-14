import mongoose from "mongoose";

const { Schema } = mongoose;

const gameSessionSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pin: { type: String, required: true, unique: true },
    shareCode: { type: String, required: true, unique: true },
    state: {
      type: String,
      enum: ["waiting", "active", "ended"],
      default: "waiting",
    },
    hasStarted: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
    questionStartedAt: { type: Date, default: null },
    connectedStudents: [{ type: Schema.Types.ObjectId, ref: "User" }],
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
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

gameSessionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform,
});

gameSessionSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform,
});

const GameSession =
  mongoose.models.GameSession ||
  mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
