const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("new_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server Running");
});
app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  const sql =
    "SELECT * FROM users WHERE email=? AND password=? AND role=?";

  db.query(sql, [email, password,role], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    res.json(result[0]);
  });
});
server.listen(process.env.PORT, () => {
  console.log("Server Started");
});