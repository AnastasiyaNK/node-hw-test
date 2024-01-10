const express = require("express");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const {
  registerUserSchema,
  User,
  loginUserSchema,
} = require("../../models/user");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const body = req.body;

  const { error } = registerUserSchema.validate(body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const doesUserExist = await User.exists({ email: body.email });
  if (doesUserExist) {
    res.status(409).json({
      message: "Email in use",
    });
    return;
  }

  const hashedPassword = bcryptjs.hashSync(body.password, 10);

  const user = await User.create({
    email: body.email,
    password: hashedPassword,
  });

  res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

router.post("/login", async (req, res, next) => {
  const body = req.body;

  const { error } = loginUserSchema.validate(body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  try {
    const user = await User.findOne({ email: body.email });

    const doesPasswordMatches = bcryptjs.compare(body.password, user.password);
    if (!doesPasswordMatches) {
      res.status(401).json({ message: "Email or password is wrong" });
      return;
    }
    const payload = { _id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Email or password is wrong" });
  }
});

module.exports = router;
