const express = require("express");
const http = require("http"); // Import the http module
const socketIo = require("socket.io");
const morgan = require("morgan");
const app = express();
const { config } = require("dotenv");
const cors = require("cors");
if (process.env.NODE_ENV !== "production") {
  config();
  app.use(morgan("dev"));
}
const port = process.env.PORT || 3000;

const { connectDB } = require("./db/connectDb");
const authRouter = require("./routes/authRoute");
const cookieParser = require("cookie-parser");
const channelRoute = require("./routes/channelRoute");

const server = http.createServer(app); // Create an HTTP server

const io = socketIo(server, {
  cors: {
    origin: JSON.parse(process.env.ORIGIN),
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: JSON.parse(process.env.ORIGIN),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Function to convert seconds to hours and minutes
function secondsToHms(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return { hours: h, minutes: m };
}
let body=null
// Define a route for the root URL ("/")
app.get("/", (req, res) => {
  const uptime = process.uptime(); // Get the server uptime in seconds
  const hostname = req.hostname; // Get the hostname
  const fullUrl = req.protocol + "://" + req.get("host"); // Get the full URL

  const timeElapsed = secondsToHms(uptime);

  const jsonResponse = {
    uptimeSeconds: uptime,
    uptimeHours: timeElapsed.hours,
    uptimeMinutes: timeElapsed.minutes,
    message: "Hello, World!",
    domain: hostname,
    port: port,
    fullUrl: fullUrl,
  };
  if (body) {
    jsonResponse["body"] = body;
  }
  res.json(jsonResponse);
});
app.post("/", (req, res) => {
  body = req.body;
  console.log("req body", body);
  res.json(body);
});
app.use("/api/auth", authRouter);
app.use("/api/channels", channelRoute);

server.listen(port, () => {
  console.log(
    "Server listening at port => " +
      port +
      " in " +
      process.env.NODE_ENV.toUpperCase() +
      " mode"
  );
  connectDB(
    process.env.MONGO_URI ||
      "mongodb+srv://test:test@nodejs.sfhyc.mongodb.net/channel-app"
  );
});
const onlineUsers = new Map();

const addOnlineUser = (socketId, channelId, user) => {
  const users = onlineUsers.get(channelId) || [];
  const found = users.find((x) => x.id === user.id);

  if (!found) {
    users.push({ ...user, socketId });
    onlineUsers.set(channelId, users);
  }
  return users;
};

const removeOnlineUser = (channelId, user) => {
  const users = onlineUsers.get(channelId);

  if (users) {
    const newUsers = users.filter((x) => x.id !== user?.id);
    onlineUsers.set(channelId, newUsers);
    return newUsers;
  }
  return [];
};

io.on("connection", async (socket) => {
  socket.on("join", (data, callback) => {
    if (data) {
      addOnlineUser(socket.id, data.channelId, data.user);
      socket.join(data.channelId);

      const users = onlineUsers.get(data.channelId);
      callback(users);
      socket.in(data.channelId).emit("onlineUsers", users);
    }
  });
  socket.on("Pause", (data) => {
    socket.in(data.channelId).emit("listenPause", data);
  });
  socket.on("Play", (data) => {
    socket.in(data.channelId).emit("listenPlay", data);
  });
  socket.on("setAudio", (data) => {
    if (data) {
      const { channelId } = data;
      socket.in(channelId).emit("listenSetAudio", data);
    }
  });

  socket.on("setAudioTime", (data) => {
    if (data) {
      const { channelId } = data;
      socket.in(channelId).emit("listenSetAudioTime", data);
    }
  });
  socket.on("resetAudio", (data) => {
    socket.in(data.channelId).emit("listenResetAudio", data);
  });
  socket.on("sendAudio", (data) => {
    if (data) {
      const { channelId } = data;
      socket.in(channelId).emit("listenSendAudio", data);
    }
  });

  socket.on("leave", (data) => {
    if (data) {
      console.log("A user disconnected with socketId => " + socket.id);

      const users = removeOnlineUser(data.channelId, data.user);
      socket.in(data.channelId).emit("onlineUsers", users);
    }
  });
  socket.on("sendText", (data) => {
    if (data) {
      socket.to(data.channelId).emit("receiveText", data);
      // socket.emit("receiveText", data);
    }
  });
  socket.on("disconnect", () => {
    console.log("-----------------------------------------------");
  });
});
