const { Schema, model } = require("mongoose");
const { genSalt, hash, compare } = require("bcrypt");

const UserSchema = new Schema({
  password: {
    type: String,
   
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  code: {
    type: Number,
  },
  metamaskAddress: {
    type: String,
    required: true,
  },
  authenticatedDevices: [String],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return compare(password, this.password);
};

const User = model("User", UserSchema);
module.exports = User;
