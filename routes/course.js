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
const validateCourse = require("../middleware/validateCourse");

// only admins can create
router.post("/", authenticateJWT, requireAdmin, validateCourse, createCourse);

// public: list all
router.get("/", getAllCourses);

// public: get course by id
router.get("/:id", getCourseById);

// only owners of courses can update/delete
router.put("/:id", authenticateJWT, requireCourseOwnership, updateCourse);
router.delete("/:id", authenticateJWT, requireCourseOwnership, deleteCourse);

module.exports = router;
