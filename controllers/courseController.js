const pool = require("../config/db");

//admin can create a course
exports.createCourse = async (req, res) => {
  const { title, description, instructor, price } = req.body;
  const owner_id= req.user.user_id;

  //input validation
  if (!title || !description || !instructor || price === undefined) {
    return res.status(400).json({ message: "All fields required" });
  }

  //insert into db
  const result = await pool.query(
    "INSERT INTO courses (title,description,instructor,price,owner_id) values ($1,$2,$3,$4,$5) returning *",
    [title, description, instructor, price]
  );

  res.status(201).json(result.rows[0]);
};

//list all courses
exports.getAllCourses = async (req, res) => {
  const result = await pool.query(
    "select * from courses order by created_at desc"
  );
  res.status(201).json(result.rows);
};

//get one course by id
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("select * from courses where id=$1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ 
        message: "Course not found" 
    });
  }
  res.json(result.rows[0]);
};
