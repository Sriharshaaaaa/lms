const pool = require("../config/db");

//user enrolls in a course
exports.enrollCourse = async (req, res) => {
  const userId = req.user.userId;
  const courseId = req.params.id;

  try {
    //check if course exists
    const courseResult = await pool.query(
      "select * from courses where id =$1",
      [courseId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    //insert enrollment, catch duplicate errors
    try {
      const enrollResult = await pool.query(
        "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *",
        [userId, courseId]
      );

      res.status(201).json({ message: "Enrolled successfully" });
    } catch (err) {
      if (err.code === "23505") {
        //duplicate key error
        return res.status(400).json({
          message: "Already enrolled in this course",
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("Error enrolling in course:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};
