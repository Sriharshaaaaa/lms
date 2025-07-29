const express = require("express");
const router = express.Router();
const {
  createQuiz,
  createQuestion,
  getQuizWithQuestions,
} = require("../controllers/quizController");
const { authenticateJWT } = require("../middleware/auth");

router.post("/quizzes", authenticateJWT, createQuiz);
router.post("/questions", authenticateJWT, createQuestion);
router.get("/quizzes/:id", getQuizWithQuestions);

module.exports = router;
