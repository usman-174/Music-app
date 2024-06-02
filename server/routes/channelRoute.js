const express = require("express");
const {
  getChannelsByAdminid,
  getMessagesByChannelId,
  postMessagesByChannelId,
  updateChannel,
  addMember,
  createChannel,
} = require("../controllers/channelController");
const {
  authenticateUser,
  authorizRoute,
} = require("../middleware/authenticate");
const channelRoute = express.Router();

channelRoute.get(
  "/:adminId",
  authenticateUser,
  authorizRoute,
  getChannelsByAdminid
);
channelRoute.get(
  "/messages/:channelId",
  authenticateUser,
  authorizRoute,
  getMessagesByChannelId
);
channelRoute.post(
  "/messages/:channelId",
  authenticateUser,
  authorizRoute,
  postMessagesByChannelId
);
channelRoute.post(
  "/add-members/:channelId",
  authenticateUser,
  authorizRoute,
  addMember
);
channelRoute.post("/", authenticateUser, authorizRoute, createChannel);
channelRoute.put("/:channelId", authenticateUser, authorizRoute, updateChannel);

module.exports = channelRoute;
