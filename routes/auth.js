const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { validateIsAdmin } = require("../middleware/validateIsAdmin");
const { body, validationResult } = require("express-validator");

router.post("/signup", validateIsAdmin, signup);
router.post("/login", login);

module.exports = router;
