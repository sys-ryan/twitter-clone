const path = require("path");

const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
require("./db/mongoose");
const session = require("express-session");

const middleware = require("./middleware");

const server_config = require("./env/server-config.json");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: server_config.session_secret,
    resave: true,
    saveUninitialized: false,
  })
);

// Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logout");
const postRoute = require("./routes/postRoute");
const profileRoute = require("./routes/profileRoute");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");
const messagesRoute = require("./routes/messagesRoutes");
const notificationsRoute = require("./routes/notificationRoute");

// API routes
const postsApiRoutes = require("./routes/api/posts");
const usersApiRoutes = require("./routes/api/users");
const chatsApiRoutes = require("./routes/api/chats");
const messagesApiRoutes = require("./routes/api/messages");
const notificationsApiRoutes = require("./routes/api/notifications");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);

app.use("/api/posts", postsApiRoutes);
app.use("/api/users", usersApiRoutes);
app.use("/api/chats", chatsApiRoutes);
app.use("/api/messages", messagesApiRoutes);
app.use("/api/notifications", middleware.requireLogin, notificationsApiRoutes);

app.get("/", middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.render("home", payload);
});

const server = app.listen(server_config.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});

const io = require("socket.io")(server, { pingTimeout: 60000 });

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => socket.join(room));

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("new message", (newMessage) => {
    let chat = newMessage.chat;
    if (!chat.users) {
      return console.log("Chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;

      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.on("notification received", (room) =>
    socket.in(room).emit("notification received")
  );
});
