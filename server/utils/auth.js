const jwt = require("jsonwebtoken");

// Generate and sign a JWT
function signJWT(user) {
  const payload = {
    userId: user.id, // You can include user-specific information in the payload
  };

  const secretKey = process.env.JWT_SECRET || "secret"; // Replace with your secret key
  const options = {
    expiresIn: "1d", // Set the expiration time for the token
  };

  const token = jwt.sign(payload, secretKey, options);

  return token;
}

const removeToken = (res) => {
  try {
    const cookieOptions = {
      expires: new Date(Date.now() - 20),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none":"lax",
      path: "/",
    };

    return res
      .cookie("jwt", "", cookieOptions)
      .json({ success: true, message: "Logged out" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
module.exports = { signJWT, removeToken };
