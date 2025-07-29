const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  completeLesson,
  attemptQuiz,
} = require("../controllers/progressController");

router.post("/lessons/complete", authenticateJWT, completeLesson);
router.post("/quizzes/attempt", authenticateJWT, attemptQuiz);

module.exports = router;
