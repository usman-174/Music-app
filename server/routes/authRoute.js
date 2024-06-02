const express = require("express");
const { login, register ,getMe, singout,getPeople} = require("../controllers/authController");
const { authenticateUser, authorizRoute } = require("../middleware/authenticate");
const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me",authenticateUser,authorizRoute, getMe);
authRouter.post("/logout",authenticateUser,authorizRoute, singout);
authRouter.get("/people",authenticateUser,authorizRoute, getPeople);

module.exports = authRouter;
