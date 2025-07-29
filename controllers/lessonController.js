const pool = require("../config/db");

//create a lesson (only owner)
exports.createLesson = async (req, res) => {
  const [course_id, title, video_url, description] = req.body;
  const userId = req.user.userId;

  if (!course_id || !title || !video_url) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    //check if user owns the course
    const course = await pool.query(
      "select owner_id from courses where id=$1",
      [course_id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.rows[0].owner_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this course" });
    }

    //insert lesson ; resources is optional,default to empty array if missing
    const lessonResources = Array.isArray(resources) ? resources : [];
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, video_url, resources) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_id, title, video_url, JSON.stringify(lessonResources)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
