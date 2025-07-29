const pool = require("../config/db");

// Create a quiz (owner-only)
exports.createQuiz = async (req, res) => {
  const { course_id, title } = req.body;
  const userId = req.user.userId;

  if (!course_id || !title) {
    return res.status(400).json({ message: "course_id and title required" });
  }

  try {
    // Verify the logged-in user owns the course
    const course = await pool.query(
      "SELECT owner_id FROM courses WHERE id = $1",
      [course_id]
    );
    if (course.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.rows[0].owner_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not the course owner" });
    }

    const result = await pool.query(
      "INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING *",
      [course_id, title]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a question under a quiz (owner-only)
exports.createQuestion = async (req, res) => {
  const { quiz_id, text, options, correct_idx } = req.body;
  const userId = req.user.userId;

  if (!quiz_id || !text || !options || correct_idx === undefined) {
    return res
      .status(400)
      .json({ message: "quiz_id, text, options, correct_idx required" });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ message: "options must be an array of at least two choices" });
  }

  if (correct_idx < 0 || correct_idx >= options.length) {
    return res
      .status(400)
      .json({ message: "correct_idx must be a valid index in options" });
  }

  try {
    // Verify user owns the course to which this quiz belongs
    const quiz = await pool.query(
      "SELECT course_id FROM quizzes WHERE id = $1",
      [quiz_id]
    );
    if (quiz.rows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const course = await pool.query(
      "SELECT owner_id FROM courses WHERE id = $1",
      [quiz.rows[0].course_id]
    );
    if (course.rows.length === 0 || course.rows[0].owner_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not the course owner" });
    }

    const result = await pool.query(
      `INSERT INTO questions (quiz_id, text, options, correct_idx)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [quiz_id, text, JSON.stringify(options), correct_idx]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get quiz with questions by quiz ID (public, any user can view)
exports.getQuizWithQuestions = async (req, res) => {
  const { id } = req.params; // quiz id

  try {
    const quizResult = await pool.query("SELECT * FROM quizzes WHERE id = $1", [
      id,
    ]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const quiz = quizResult.rows[0];

    const questionsResult = await pool.query(
      "SELECT id, text, options FROM questions WHERE quiz_id = $1 ORDER BY id",
      [id]
    );

    res.json({
      ...quiz,
      questions: questionsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
