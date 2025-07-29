const express = require("express");
const dotenv = require("dotenv");
const pool = require("./config/db");
dotenv.config();

const app = express();
const authRoutes = require("./routes/auth");

process.on("unhandledRejection", (err) => {
  console.error(" Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err.message);
  process.exit(1);
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("LMS api is working");
});

app.use("/api/auth", authRoutes);

const courseRoutes = require("./routes/course");
app.use("/api/courses", courseRoutes);

const validateCourse = require("../middleware/validateCourse");
router.post("/", authenticateJWT, createCourse, validateCourse);

const enrollmentRoutes = require("./routes/enrollment");
app.use("/api", enrollmentRoutes);

const lessonRoutes = require("./routes/lesson");
app.use("/api/lessons", lessonRoutes);

const quizRoutes = require("./routes/quiz");
app.use("/api", quizRoutes);

const progressRoutes = require("./routes/progress");
app.use("/api", progressRoutes);

const apiLimiter = require("./middleware/rateLimiter");
app.use("/api", apiLimiter);

console.log("Loaded PORT:", process.env.PORT);
const PORT = 5000;

try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error(" Server failed to start:", err);
}
