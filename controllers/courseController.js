const pool = require("../config/db");

//admin can create a course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, price } = req.body;
    const owner_id = req.user.userId;

    //input validation
    if (!title || !description || !instructor || price === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    //insert into db
    const result = await pool.query(
      "INSERT INTO courses (title,description,instructor,price,owner_id) values ($1,$2,$3,$4,$5) returning *",
      [title, description, instructor, price, owner_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//list all courses
exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(
      "select * from courses order by created_at desc"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get one course by id
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  // const result = await pool.query("select * from courses where id=$1", [id]);
  // if (result.rows.length === 0) {
  //   return res.status(404).json({
  //     message: "Course not found",
  //   });
  // }
  // res.json(result.rows[0]);

  try {
    const courseResult = await pool.query("select * from courses where id=$1", [
      id,
    ]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    const course = courseResult.rows[0];

    //get lessons for this course
    const lessonResult = await pool.query(
      "select id,title,video_url,resources from lessons where course_id=$1 order by id",
      [id]
    );

    //get quizzes for this course (without questions detail here)
    const quizzesResult = await pool.query(
      "select id,title from quizzes where course_id =$1 order by id",
      [id]
    );

    //return combined result
    res.json({
      ...course,
      lessons: lessonResult.rows,
      quizzes: quizzesResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update course - only ownr can update
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, price } = req.body;
    const owner_id = req.user.userId;

    //input validation
    if (!title || !description || !instructor || price === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    //check ownership handled by middleware so no need to re check here
    const result = await pool.query(
      `update courses set title=$1,description=$2,instructor=$3,price=$4 where id=$5 and owner_id=$6 returning *`,
      [title, description, instructor, price, id, owner_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Course not found or you do not have permission to update this course",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete course only by the owner
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.userId;
    const result = await pool.query(
      "delete from courses where id=$1 and owner_id=$2 returning *",
      [id, owner_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Course not found or you do not have permission to delete this course because you are not the owner",
      });
    }

    res.json({ message: "Course deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
