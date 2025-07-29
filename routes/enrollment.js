const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const { enrollCourse } = require("../controllers/enrollmentController");

router.post("/courses/:id/enroll", authenticateJWT, enrollCourse);

module.exports = router;
