const jwt = require("jsonwebtoken");
const User = require("../models/Users"); // Import your User model
const { JWT_SECRET } = process.env; // Use your JWT secret key from environment variables

// Middleware to get the authenticated user and store it in res.locals
async function authenticateUser(req, res, next) {
  // Get the JWT from the cookie or from the request headers
  const token = req.cookies.jwt || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    // No token found, user is not authenticated
    return next();
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      // User not found, or an error occurred, user is not authenticated
      return next();
    }

    // User is authenticated, store it in res.locals
    res.locals.user = user;

    next();
  } catch (error) {
    console.log("error", error.message);
    return next();
  }
}
async function authorizRoute(req, res, next) {
  if (res.locals?.user) {
    return next();
  }
  return res.status(402).json({ error: "Not Authenticated" });
}
module.exports = { authenticateUser, authorizRoute };
