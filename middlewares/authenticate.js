const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authenticate;
