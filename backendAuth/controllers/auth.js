require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/user.js");
const { web3, authLoggerContract } = require("../config/blockchain");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generate2FACode = () => Math.floor(100000 + Math.random() * 900000);

exports.login = async (req, res) => {
  try {
    const { email, password, account, dataa } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authenticatedDevices.includes(req.ip)) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true });
      return res.json({ message: "Login successful, 2FA bypassed" });
    } else {
      const code = generate2FACode();
      user.code = code;
      await user.save();

      var mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Your 2FA Code",
        text: `Your login 2FA code is ${code}`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return res.redirect(`http://localhost:5173/login`);
        } else {
          return res
            .status(200)
            .json({ message: "2FA code sent to email", userId: user._id });
        }
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.metamaskLogin = async (req, res) => {
  try {
    const { account, dataa } = req.body;

    const user = await User.findOne({ metamaskAddress: account });

    const trxn = await logLoginAttempt("Successful", account, dataa);
    if (user && trxn) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true });
      return res.json({ message: "Login successful using meteamask" });
    } else {
      return res.json({ message: "Login unsuccessful" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  const { email, code, rememberMe } = req.body;

  const user = await User.findOne({ email });
  if (user.code == code) {
    if (rememberMe) {
      if (!user.authenticatedDevices.includes(req.ip))
        user.authenticatedDevices.push(req.ip);

      await user.save();
    }
    const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    // delete loginSessions[email];
    res.json({ message: "Login successful" });
  } else {
    res.status(400).json({ message: "Invalid 2FA code" });
  }
};
exports.signUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};
exports.metamaskSignup = async (req, res) => {
  const { account } = req.body;
  console.log(account);
  try {
    const existingUser = await User.findOne({ metamaskAddress: account });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      metamaskAddress: account,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

async function logLoginAttempt(status, account, data) {
  try {
   
    const encodedData = authLoggerContract.methods
      .recordLogin(status)
      .encodeABI();

    // const nonce = await web3.eth.getTransactionCount(account, "latest");

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        from: account,
        to: process.env.CONTRACT_ADDRESS,
        data: encodedData, // Use the encoded data here
        // nonce,
        gas: 2000000, // Adjust gas limit as needed
        maxPriorityFeePerGas: web3.utils.toWei("30", "gwei"), // Increase to meet the network minimum
        maxFeePerGas: web3.utils.toWei("100", "gwei"),
      },
      process.env.PRIVATE_KEY
    );

    // console.log(signedTx);
    // console.log(signedTx.rawTransaction);

    const trxn = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    if(trxn)
      return true;

    return false;
    
  } catch (error) {
    console.error("Error logging login attempt:", error);
  }
}
