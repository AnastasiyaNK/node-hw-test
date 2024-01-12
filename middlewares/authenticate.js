const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  try {
    const { _id } = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(_id);
    if (!user || !user.token || user.token !== token) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { authenticate };
