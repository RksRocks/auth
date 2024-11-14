const express = require("express");
const {
  login,
  verify2FA,
  signUp,
  metamaskLogin,
  metamaskSignup,
} = require("../controllers/auth");
const router = express.Router();

router.post("/login", login);
router.post("/metamasklogin", metamaskLogin);
router.post("/verify2fa", verify2FA);
router.post("/signup", signUp);
router.post("/metamasksignup", metamaskSignup);
module.exports = router;
