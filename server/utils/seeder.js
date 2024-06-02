const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Channel = require("../models/Channel");
const User = require("../models/Users");

mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/channel-app",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const sendDummyMessages = async (channel, members) => {
  const numberOfMessages = 5;
  const messages = [];

  for (let i = 0; i < numberOfMessages; i++) {
    const sender = members[Math.floor(Math.random() * members.length)];
    const text = faker.lorem.sentence();

    messages.push({ sender, text });
  }

  channel.messages = messages;
  await channel.save();
};

// Function to seed channels
const seedChannels = async () => {
  try {
    // Fetch all channels
    const channels = await Channel.find();

    // Iterate through each channel
    for (const channel of channels) {
      // Fetch members of the channel
      const members = await User.find({ _id: { $in: channel.members } });

      // Send dummy messages in the channel
      await sendDummyMessages(channel, members);
    }

    console.log("Seeder: Messages sent to channels successfully.");
  } catch (error) {
    console.error("Seeder: Error seeding channels:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Call the seedChannels function to initiate the seeding
seedChannels();
