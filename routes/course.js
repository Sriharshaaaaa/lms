const express = require("express");
const router = express.Router();

const { requireCourseOwnership } = require("../middleware/auth");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { authenticateJWT, requireAdmin } = require("../middleware/auth");

//only admins can create
router.post("/", authenticateJWT, requireAdmin, createCourse);
//public:list all
router.get("/", getAllCourses);
//public:get course
router.get("/:id", getCourseById);

router.put("/:id", authenticateJWT, requireCourseOwnership, updateCourse);
router.delete("/:id", authenticateJWT, requireCourseOwnership, deleteCourse);
module.exports = router;
