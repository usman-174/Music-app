const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,

    unique: true,
  },
});

// Pre-save middleware to hash and salt the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});
// Utility function to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}; 

// Update the schema toJSON to change _id to id
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Ensure password is not included in the serialized object
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
