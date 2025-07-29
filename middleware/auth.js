const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.requireCourseOwnership = async (req, res, next) => {
  const userId = req.user.userId;
  const courseId = req.params.courseId;

  try {
    const result = await pool.query(
      "select owner_id from courses where id=$1",
      [courseId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (result.rows[0].owner_id !== userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this course",
      });
    }
    next();
  } catch (err) {
    console.error("Error checking course ownership:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message:
        "Authorization header is missing. Please provide a token in the format: 'Authorization: Bearer <token>'",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return res.status(401).json({
      message:
        "Malformed Authorization header. Format should be: 'Authorization: Bearer <token>'",
    });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res
      .status(403)
      .json({ message: "Access denied, admin role required" });
  }
  next();
};
