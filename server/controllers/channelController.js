const Channel = require("../models/Channel");
const sanitize = require('mongo-sanitize');

const getChannelsByAdminid = async (req, res) => {
  const admin = req.params.adminId;
  try {
    const channels = await Channel.find({ admin }).populate("members");
    return res.json({ success: true, channels });
  } catch (error) {
    return res.status(400).json({ success: false, error: "No Channels Found" });
  }
};
const addMember = async (req, res) => {
  const _id = req.params.channelId;
  const { user } = res.locals; // Assuming you have stored the user information in res.locals
  const { members } = req.body;

  try {
    // Find the channel by its ID
    const channel = await Channel.findOne({ _id });

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, error: "Channel not found" });
    }

    // Check if the user is an admin or the channel is not at maximum capacity (6 members)
    if (
      user.id.toString() === channel.admin.toString() ||
      channel.members.length < 6
    ) {
      // Add new members to the 'members' array
      members.forEach((newMember) => {
        // Ensure the user is not already a member
        if (
          !channel.members.some(
            (existingMember) => existingMember.toString() === newMember
          )
        ) {
          channel.members.push(newMember);
        }
      });

      // Save the updated channel with additional members
      await channel.save();

      return res.json({ success: true, channel });
    } else {
      return res.status(403).json({
        success: false,
        error: "User is not allowed to add more members",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error adding members to the channel" });
  }
};

const getMessagesByChannelId = async (req, res) => {
  const _id = req.params.channelId;
  const { user } = res.locals; // Assuming you have stored the user information in res.locals

  try {
    const channel = await Channel.findOne({ _id }).populate(
      "members admin messages.sender"
    );

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, error: "Channel not found" });
    }

    // Check if the user is a member of the channel
    const isUserMember =
      channel.members.some(
        (member) => member.id.toString() === user.id.toString()
      ) || channel.admin.id.toString() === user.id.toString();

    if (isUserMember) {
      return res.json({ success: true, messages: channel });
    } else {
      return res.status(403).json({
        success: false,
        error: "You are not the member of the Channel",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error fetching messages" });
  }
};

const postMessagesByChannelId = async (req, res) => {
  const _id = req.params.channelId;
  const { user } = res.locals; // Assuming you have stored the user information in res.locals
  const { text, by, timestamp } = req.body; // Assuming the message text is in the 'text' field

  // Sanitize user input
  const sanitizedText = sanitize(text);
  const sanitizedBy = sanitize(by);
  const sanitizedTimestamp = sanitize(timestamp);

  const message = {
    sender: user.id, // Store the sender's ID in the message
    text: sanitizedText,
    by: sanitizedBy,
    timestamp: sanitizedTimestamp,
  };

  try {
    const channel = await Channel.findOne({ _id }).populate("members messages");

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, error: "Channel not found" });
    }

    // Check if the user is a member of the channel
    const isUserMember =
      channel.members.some(
        (member) => member.id.toString() === user.id.toString()
      ) || channel.admin.toString() === user.id.toString();

    if (!isUserMember) {
      return res
        .status(403)
        .json({ success: false, error: "User is not a member of the channel" });
    }

    // Push the new message to the 'messages' array
    channel.messages.push(message);

    // Save the updated channel
    await channel.save();

    return res.json({ success: true, message });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message || "Error posting message" });
  }
};

const createChannel = async (req, res) => {
  const { name, members } = req.body;
  const admin = res.locals.user.id; // Assuming you have the user information in req.user
  console.log(req.body);
  try {
    // Validate the members array to ensure it's not more than 6 members.
    if (members.length > 6) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum 6 members allowed" });
    }

    // Create a new channel with the provided data
    const channel = new Channel({
      name:sanitize(name),
      admin,
      members,
    });

    // Save the channel to the database
    await channel.save();

    return res.status(201).json({ success: true, channel });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create a channel",
    });
  }
};
const updateChannel = async (req, res) => {
  const { channelId } = req.params;
  const { name, members } = req.body;

  try {
    // Find the channel by channelId
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, error: "Channel not found" });
    }

    // Validate the members array to ensure it's not more than 6 members.
    if (members && members.length > 6) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum 6 members allowed" });
    }

    // Update the channel's name and members
    if (name) {
      channel.name = sanitize(name);
    }
    if (members) {
      channel.members = sanitize(members);
    }

    // Save the updated channel
    await channel.save();

    return res.json({ success: true, channel });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update the channel",
    });
  }
};

module.exports = {
  getChannelsByAdminid,
  getMessagesByChannelId,
  createChannel,
  postMessagesByChannelId,
  addMember,
  updateChannel,
};
