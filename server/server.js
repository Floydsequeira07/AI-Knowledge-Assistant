const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");
const Groq = require("groq-sdk");

require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const app = express();
const server = http.createServer(app);

let onlineEmployees = [];

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-knowledge-assistant1.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an origin
    // such as Postman/server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  /* =========================
     EMPLOYEE ONLINE
  ========================= */

  socket.on("employee_online", (data) => {
    if (!onlineEmployees.includes(data.email)) {
      onlineEmployees.push(data.email);
    }

    io.emit("online_employees", onlineEmployees);
  });

  /* =========================
     NEW MESSAGE
  ========================= */

  socket.on("new_message", (data) => {
    io.emit("receive_message", data);

    db.query(
      `
      INSERT INTO messages
      (session_id, sender, content)
      VALUES (?, ?, ?)
      `,
      [
        data.session_id,
        data.sender,
        data.text,
      ],
      (err) => {
        if (err) {
          console.log("Message save error:", err);
        }
      }
    );
  });

  /* =========================
     EMPLOYEE OFFLINE
  ========================= */

  socket.on("employee_offline", (data) => {
    onlineEmployees = onlineEmployees.filter(
      (emp) => emp !== data.email
    );

    io.emit("online_employees", onlineEmployees);
  });

  /* =========================
     DISCONNECT
  ========================= */

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.send("Server Running");
});

/* =========================
   LOGIN
========================= */

app.post("/login", (req, res) => {
  const {
    email,
    password,
    role,
  } = req.body;

  const sql =
    "SELECT * FROM users WHERE email=? AND password=? AND role=?";

  db.query(
    sql,
    [email, password, role],
    (err, result) => {
      if (err) {
        console.log("Login DB error:", err);
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Invalid Credentials",
        });
      }

      res.json(result[0]);
    }
  );
});

/* =========================
   GET EMPLOYEES
========================= */

app.get("/employees", (req, res) => {
  db.query(
    "SELECT email FROM users WHERE role='employee'",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

/* =========================
   CREATE SESSION
========================= */

app.post("/session", (req, res) => {
  const { employee_id } = req.body;

  db.query(
    `
    INSERT INTO chat_sessions
    (employee_id)
    VALUES (?)
    `,
    [employee_id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        sessionId: result.insertId,
      });
    }
  );
});

/* =========================
   GET SESSION MESSAGES
========================= */

app.get("/messages/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  db.query(
    `
    SELECT * FROM messages
    WHERE session_id = ?
    ORDER BY created_at ASC
    `,
    [sessionId],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

/* =========================
   GET ALL MESSAGES
========================= */

app.get("/all-messages", (req, res) => {
  db.query(
    `
    SELECT
      messages.*,
      users.email
    FROM messages
    JOIN chat_sessions
      ON messages.session_id = chat_sessions.id
    JOIN users
      ON chat_sessions.employee_id = users.id
    ORDER BY messages.created_at ASC
    `,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

/* =========================
   EMPLOYEE SESSIONS
========================= */

app.get(
  "/employee-sessions/:email",
  (req, res) => {
    const { email } = req.params;

    db.query(
      `
      SELECT
        chat_sessions.id,
        chat_sessions.created_at,
        chat_sessions.stopped,

        (
          SELECT content
          FROM messages
          WHERE messages.session_id = chat_sessions.id
          AND sender = 'employee'
          ORDER BY created_at ASC
          LIMIT 1
        ) AS first_message

      FROM chat_sessions

      JOIN users
        ON chat_sessions.employee_id = users.id

      WHERE users.email = ?

      ORDER BY chat_sessions.created_at DESC
      `,
      [email],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.json(result);
      }
    );
  }
);

/* =========================
   STOP SESSION
========================= */

app.put(
  "/stop-session/:id",
  (req, res) => {
    const { id } = req.params;

    db.query(
      `
      UPDATE chat_sessions
      SET stopped = TRUE
      WHERE id = ?
      `,
      [id],
      (err) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          message: "Session stopped",
        });
      }
    );
  }
);

/* =========================
   GET KNOWLEDGE BASE
========================= */

app.get("/kb", (req, res) => {
  db.query(
    "SELECT * FROM kb_articles",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

/* =========================
   ADD ARTICLE
========================= */

app.post("/kb", (req, res) => {
  const {
    title,
    content,
  } = req.body;

  db.query(
    `
    INSERT INTO kb_articles
    (title, content)
    VALUES (?, ?)
    `,
    [title, content],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Added",
      });
    }
  );
});

/* =========================
   UPDATE ARTICLE
========================= */

app.put("/kb/:id", (req, res) => {
  const { id } = req.params;

  const {
    title,
    content,
  } = req.body;

  db.query(
    `
    UPDATE kb_articles
    SET title=?, content=?
    WHERE id=?
    `,
    [title, content, id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Updated",
      });
    }
  );
});

/* =========================
   DELETE ARTICLE
========================= */

app.delete("/kb/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM kb_articles WHERE id=?",
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Deleted",
      });
    }
  );
});

/* =========================
   CHAT WITH AI
========================= */

app.post("/chat", async (req, res) => {
  const {
    message,
    session_id,
  } = req.body;

  /* =========================
     CHECK SESSION
  ========================= */

  db.query(
    `
    SELECT stopped
    FROM chat_sessions
    WHERE id = ?
    `,
    [session_id],
    (err, session) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (session.length === 0) {
        return res.status(404).json({
          message: "Session not found",
        });
      }

      if (session[0].stopped) {
        return res.json({
          reply:
            "This chat session has been stopped by admin.",
        });
      }

      /* =========================
         GET KNOWLEDGE BASE
      ========================= */

      db.query(
        "SELECT * FROM kb_articles",
        async (err, kb) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (kb.length === 0) {
            return res.json({
              reply:
                "No knowledge base configured. Please contact your admin.",
            });
          }

          /* =========================
             CREATE KNOWLEDGE BASE
          ========================= */

          const knowledgeBase = kb
            .map(
              (item) =>
                `[${item.title}]: ${item.content}`
            )
            .join("\n");

          /* =========================
             AI PROMPT
          ========================= */

          const systemPrompt = `
You are a helpful assistant.

Answer questions ONLY using the following knowledge base.

If the user's question, greeting, or message
is not found inside the knowledge base,
reply ONLY with:

"I don't have that information."

Do not generate greetings,
introductions,
conversations,
or extra explanations.

Knowledge Base:
${knowledgeBase}
`;

          try {
            /* =========================
               GROQ
            ========================= */

            const response =
              await groq.chat.completions.create({
                model:
                  "llama-3.3-70b-versatile",

                messages: [
                  {
                    role: "user",
                    content:
                      `${systemPrompt}\n\nQuestion: ${message}`,
                  },
                ],
              });

            const botReply =
              response.choices[0]
                .message.content;

            /* =========================
               SAVE BOT MESSAGE
            ========================= */

            db.query(
              `
              INSERT INTO messages
              (session_id, sender, content)
              VALUES (?, ?, ?)
              `,
              [
                session_id,
                "bot",
                botReply,
              ],
              (err) => {
                if (err) {
                  console.log(
                    "Bot message save error:",
                    err
                  );
                }
              }
            );

            /* =========================
               SEND RESPONSE
            ========================= */

            res.json({
              reply: botReply,
            });

          } catch (error) {
            console.log(
              "GROQ ERROR:",
              error.message
            );

            res.status(500).json({
              error: "AI request failed",
            });
          }
        }
      );
    }
  );
});

/* =========================
   START SERVER
========================= */

server.listen(
  process.env.PORT || 5000,
  () => {
    console.log(
      `Server Started on port ${
        process.env.PORT || 5000
      }`
    );
  }
);