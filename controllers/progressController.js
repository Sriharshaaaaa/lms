const pool = require("../config/db");

// Mark lesson as completed (authenticated user)
exports.completeLesson = async (req, res) => {
  const userId = req.user.userId;
  const { lesson_id } = req.body;

  if (!lesson_id) {
    return res.status(400).json({ message: "lesson_id is required" });
  }

  try {
    // Check if lesson exists
    const lesson = await pool.query(
      "SELECT course_id FROM lessons WHERE id = $1",
      [lesson_id]
    );
    if (lesson.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if user is enrolled in the course containing the lesson
    const enrollment = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, lesson.rows[0].course_id]
    );
    if (enrollment.rows.length === 0) {
      return res.status(403).json({ message: "Not enrolled in the course" });
    }

    // Upsert completion (insert if not exists)
    await pool.query(
      `INSERT INTO lesson_completions (user_id, lesson_id) 
        VALUES ($1, $2) 
        ON CONFLICT (user_id, lesson_id) DO NOTHING`,
      [userId, lesson_id]
    );

    res.json({ message: "Lesson marked as completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User attempts a quiz (multiple attempts allowed)
exports.attemptQuiz = async (req, res) => {
  const userId = req.user.userId;
  const { quiz_id, answers } = req.body; // answers is an object or array mapping questionIds to selected option index

  if (!quiz_id || !answers) {
    return res
      .status(400)
      .json({ message: "quiz_id and answers are required" });
  }

  try {
    // Verify quiz exists and get course_id
    const quiz = await pool.query(
      "SELECT course_id FROM quizzes WHERE id = $1",
      [quiz_id]
    );
    if (quiz.rows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check user enrollment in course
    const enrollment = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, quiz.rows[0].course_id]
    );
    if (enrollment.rows.length === 0) {
      return res.status(403).json({ message: "Not enrolled in the course" });
    }

    // Retrieve questions and calculate score
    const questionsResult = await pool.query(
      "SELECT id, correct_idx FROM questions WHERE quiz_id = $1",
      [quiz_id]
    );
    const questions = questionsResult.rows;

    let score = 0;
    for (const question of questions) {
      if (
        answers[question.id] !== undefined &&
        answers[question.id] === question.correct_idx
      ) {
        score++;
      }
    }

    // Save attempt
    const attemptResult = await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, answers) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, quiz_id, score, JSON.stringify(answers)]
    );

    res.json({
      attempt: attemptResult.rows[0],
      message: `Score: ${score} / ${questions.length}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
