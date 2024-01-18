const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const gravatar = require("gravatar");
const { httpError, ctrlWrapper } = require("../helpers");

const { registerUserSchema, User, loginUserSchema } = require("../models/user");

const register = async (req, res, next) => {
  const body = req.body;

  const { error } = registerUserSchema.validate(body);
  if (error) {
    throw httpError(400, error.details[0].message);
  }

  const doesUserExist = await User.exists({ email: body.email });
  if (doesUserExist) {
    throw httpError(409, "Email in use");
  }

  const hashedPassword = bcryptjs.hashSync(body.password, 10);
  const avatarURL = gravatar.url(body.email);

  const user = await User.create({
    email: body.email,
    password: hashedPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const login = async (req, res, next) => {
  const body = req.body;

  const { error } = loginUserSchema.validate(body);
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  try {
    const user = await User.findOne({ email: body.email });

    const doesPasswordMatches = await bcryptjs.compare(
      body.password,
      user.password
    );
    if (!doesPasswordMatches) {
      throw httpError(401, "Email or password is wrong");
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
    throw httpError(401, "Email or password is wrong");
  }
};
const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({ message: "No Content" });
};

const current = async (req, res, next) => {
  const { subscription, email } = req.user;

  res.json({ subscription, email });
};
const updateAvatars = async (req, res, next) => {
  const avatarsDir = path.resolve("public", "avatars");
  if (!req.file) throw httpError(400, "Missing file ");
  const { path: tempUpload, filename } = req.file;

  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);

  jimp.read(resultUpload, (err, selectedFile) => {
    if (err) throw err;
    selectedFile.resize(250, 250).write(resultUpload);
  });

  const coverPath = path.join("avatars", filename);

  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { avatarURL: coverPath });
  res.status(200).json({ avatarURL: coverPath });
};
module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateAvatars: ctrlWrapper(updateAvatars),
};
