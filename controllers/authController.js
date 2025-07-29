const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { email, password, name, is_admin } = req.body;

  // input validity
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const isAdminFlag = is_admin === true || is_admin === "true";

  //check if user exists
  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  //hash password
  const hashed = await bcrypt.hash(password, 10);

  //inserting the user into the db
  const newUser = await pool.query(
    "INSERT INTO users (email, password, name,is_admin) VALUES ($1, $2, $3,$4) RETURNING id,email,name,is_admin",
    [email, hashed, name, isAdminFlag]
  );

  //create JWT token
  const token = jwt.sign(
    { userId: newUser.rows[0].id, is_admin: newUser.rows[0].is_admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(201).json({
    ...newUser.rows[0],
    token,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // input validity
  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  //fetch user from db
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  //check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  //create JWT token
  const token = jwt.sign(
    { userId: user.id, is_admin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
    token,
  });
};
