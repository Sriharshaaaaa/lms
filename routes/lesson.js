const express = require("express");
const router = express.Router();
const { createLesson } = require("../controllers/lessonController");
const { authenticateJWT } = require("../middleware/auth");

router.post("/", authenticateJWT, createLesson);

module.exports = router;
