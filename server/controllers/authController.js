const User = require("../models/Users");
const { signJWT, removeToken } = require("../utils/auth");

const login = async (req, res) => {
  const { identifier, password } = req.body;

  const options = identifier.includes("@")
    ? { email: identifier }
    : { username: identifier };
  try {
    const user = await User.findOne(options);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT
    const token = signJWT(user);
    const cookieOptions = {
      expires: new Date(
        Date.now() +
          parseInt(process.env.COOKIE_EXPIRES_TIME || "30") *
            24 *
            60 *
            60 *
            1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };
    // Set the JWT in an HTTP-only cookie
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({ success: true, token,message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

async function register(req, res) {
  const { username, password, email } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Create a new user
    const newUser = new User({ username, password, email });

    // Save the user to the database
    await newUser.save();

    // Optionally, generate a JWT for the newly registered user
    const token = signJWT(newUser); // Use your JWT utility function

    // Set the JWT in an HTTP-only cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() +
          parseInt(process.env.COOKIE_EXPIRES_TIME || "30") *
            24 *
            60 *
            60 *
            1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    };
    // Set the JWT in an HTTP-only cookie
    res.cookie("jwt", token, cookieOptions);
    res
      .status(201)
      .json({ success: true, token,message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Registration failed" });
  }
}
async function getMe(req, res) {
  return res.status(200).json(res.locals.user);
}
async function singout(req, res) {
  removeToken(res);
}
async function getPeople(req, res) {
  const { user: me } = res.locals;
  try {
    const people = await User.find({ _id: { $ne: me.id } });
    return res.json({ success: true, people });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "No Users Found" });
  }
}
module.exports = {
  login,
  register,getPeople,
  getMe,
  singout,
};
