exports.validateIsAdmin = (req, res, next) => {
  const { is_admin } = req.body;
  if (is_admin !== undefined && typeof is_admin !== "boolean") {
    return res.status(400).json({
      message: "`is_admin` must be boolean.",
    });
  }
  next();
};
