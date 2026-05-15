const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");
const Groq = require("groq-sdk");
require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const server = http.createServer(app);
let onlineEmployees = [];

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on(
  "employee_online",
  (data) => {

    if (
      !onlineEmployees.includes(data.email)
    ) {

      onlineEmployees.push(data.email);

    }

    io.emit(
      "online_employees",
      onlineEmployees
    );

  }
);

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
    (err, result) => {

      if (err) {
        console.log(err);
      }

    }
  );

});

  socket.on(
  "employee_offline",
  (data) => {

    onlineEmployees =
      onlineEmployees.filter(
        (emp) => emp !== data.email
      );

    io.emit(
      "online_employees",
      onlineEmployees
    );

  }
);

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
app.get(
  "/messages/:sessionId",
  (req, res) => {

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

  }
);
app.get("/all-messages", (req, res) => {

  db.query(
    `
    SELECT
      messages.*,
      users.email
    FROM messages
    JOIN chat_sessions
    ON messages.session_id =
       chat_sessions.id
    JOIN users
    ON chat_sessions.employee_id =
       users.id
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
app.get(
  "/employee-sessions/:email",
  (req, res) => {

    const { email } =
      req.params;

    db.query(
      `
      SELECT
  chat_sessions.id,
  chat_sessions.created_at,
  (
    SELECT content
    FROM messages
    WHERE messages.session_id =
          chat_sessions.id
    ORDER BY created_at ASC
    LIMIT 1
  ) AS first_message
FROM chat_sessions
JOIN users
ON chat_sessions.employee_id =
   users.id
WHERE users.email = ?
ORDER BY chat_sessions.created_at DESC
      `,
      [email],
      (err, result) => {

        if (err) {
          return res
            .status(500)
            .json(err);
        }

        res.json(result);

      }
    );

  }
);
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
      (err, result) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          message:
            "Session stopped",
        });

      }
    );

  }
);
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

// ADD ARTICLE
app.post("/kb", (req, res) => {
  const { title, content } = req.body;

  db.query(
    "INSERT INTO kb_articles (title, content) VALUES (?, ?)",
    [title, content],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Added",
      });
    }
  );
});

// UPDATE ARTICLE
app.put("/kb/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  db.query(
    "UPDATE kb_articles SET title=?, content=? WHERE id=?",
    [title, content, id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Updated",
      });
    }
  );
});

// DELETE ARTICLE
app.delete("/kb/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM kb_articles WHERE id=?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Article Deleted",
      });
    }
  );
});
app.post("/chat", async (req, res) => {
  const {
  message,
  session_id,
} = req.body;
 
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

    if (
      session[0]?.stopped
    ) {

      return res.json({
        reply:
          "This chat session has been stopped by admin.",
      });

    }

    db.query(
      "SELECT * FROM kb_articles", async (err, kb) => {
    if (err) return res.status(500).json(err);
 
    if (kb.length === 0) {
      return res.json({
        reply: "No knowledge base configured. Please contact your admin.",
      });
    }
 
    const knowledgeBase = kb
      .map((item) => `[${item.title}]: ${item.content}`)
      .join("\n");
 
    const systemPrompt = `
You are a helpful assistant.
 
Answer questions ONLY using the following knowledge base.
 
If the answer is not found say exactly:
"I don't have that information."
 
Knowledge Base:
${knowledgeBase}
`;
 
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nQuestion: ${message}`,
          },
        ],
      });
 
      const botReply = response.choices[0].message.content;
      res.json({ reply: botReply });
 
    } catch (error) {
      console.log("GROQ ERROR:", error.message);
      res.status(500).json({ error: "AI request failed" });
    }
        }
  );
  });
});


server.listen(process.env.PORT, () => {
  console.log("Server Started");
});