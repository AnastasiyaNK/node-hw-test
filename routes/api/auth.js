const express = require("express");

const upload = require("../../middlewares/upload");

const {
  register,
  login,
  logout,
  current,
  updateAvatars,
  verifyEmail,
  resendVerifyEmail,
} = require("../../controllers/auth");

const { authenticate } = require("../../middlewares/authenticate");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:verificationToken", verifyEmail);

router.post("/login", login);

router.post("/logout", authenticate, logout);

router.get("/current", authenticate, current);

router.patch("/avatars", authenticate, upload.single("avatar"), updateAvatars);
router.post("/verify", resendVerifyEmail);

module.exports = router;
