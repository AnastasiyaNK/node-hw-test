const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { v4 } = require("uuid");

const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const gravatar = require("gravatar");
const { httpError, ctrlWrapper, sendMail } = require("../helpers");

const {
  registerUserSchema,
  User,
  loginUserSchema,
  emailSchema,
} = require("../models/user");
const { BASE_URL } = process.env;

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

  const verificationToken = v4();

  const hashedPassword = bcryptjs.hashSync(body.password, 10);
  const avatarURL = gravatar.url(body.email);

  const user = await User.create({
    email: body.email,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: body.email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Clik to verify email</a>`,
  };
  await sendMail(verifyEmail);

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
    if (!user.verify) throw httpError(401, "Email not verefied");

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

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) throw httpError(404, "Not found");

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.json({ message: "Verification successful" });
};
const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const { error } = emailSchema.validate({ email });
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  const user = await User.findOne({ email });
  if (!user) throw httpError(404, "Not found");
  if (user.verify) throw httpError(400, "Verification has already been passed");

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Clik to verify email</a>`,
  };
  await sendMail(verifyEmail);

  res.json({ message: "Verification email sent" });
};
module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateAvatars: ctrlWrapper(updateAvatars),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
