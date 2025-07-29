// middleware/validateCourse.js
module.exports = (req, res, next) => {
  const { title, description, instructor, price } = req.body;
  if (!title || typeof title !== "string" || title.length > 255) {
    return res
      .status(400)
      .json({ message: "Valid title is required (max 255 chars)" });
  }
  if (!description || typeof description !== "string") {
    return res.status(400).json({ message: "Valid description required" });
  }
  if (
    !instructor ||
    typeof instructor !== "string" ||
    instructor.length > 100
  ) {
    return res
      .status(400)
      .json({ message: "Valid instructor required (max 100 chars)" });
  }
  if (typeof price !== "number" || price < 0) {
    return res
      .status(400)
      .json({ message: "Valid price required (must be positive number)" });
  }
  next();
};
