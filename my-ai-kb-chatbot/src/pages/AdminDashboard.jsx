
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaBook,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,FaHistory,
FaBan,
} from "react-icons/fa";
import socket from "../socket";

function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [onlineEmployees, setOnlineEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editId, setEditId] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] =
  useState([]);
const [selectedEmployee, setSelectedEmployee] =
  useState(null);

  useEffect(() => {

  fetchArticles();
  fetchEmployees();
  fetchChats();

}, []);
  useEffect(() => {

  socket.on(
    "receive_message",
    (data) => {

     setChats((prev) => {

  const filtered =
    prev.filter(
      (chat) =>
        chat.employee !==
        data.employee
    );

  return [
    ...filtered,
    data,
  ];

});

    }
  );

  return () => {
    socket.off("receive_message");
  };

}, []);

useEffect(() => {

  socket.on(
    "online_employees",
    (data) => {

      setOnlineEmployees(data);

    }
  );

  return () => {
    socket.off("online_employees");
  };

}, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(
        "https://t2950f3p-5000.inc1.devtunnels.ms/kb"
      );

      setArticles(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addArticle = async () => {
    if (!title || !content) {
      toast.error("All fields are required");
      return;
    }

    try {
      await axios.post(
        "https://t2950f3p-5000.inc1.devtunnels.ms/kb",
        {
          title,
          content,
        }
      );

      toast.success("Article Added");

      setTitle("");
      setContent("");

      fetchArticles();
    } catch (err) {
      toast.error("Failed to add article");
    }
  };
  const fetchEmployees = async () => {

  try {

    const res = await axios.get(
      "https://t2950f3p-5000.inc1.devtunnels.ms/employees"
    );

    setEmployees(res.data);

  } catch (err) {

    console.log(err);

  }

};
const fetchSessions = async (
  employee
) => {

  try {

    const res = await axios.get(
      `https://t2950f3p-5000.inc1.devtunnels.ms/employee-sessions/${employee}`
    );

    setSessions(res.data);
    setSelectedEmployee(
  employee
);

setHistory([]);

  } catch (err) {

    console.log(err);

  }

};
const fetchHistory = async (
  sessionId,
  employee
) => {

  if (
    selectedEmployee === employee
  ) {

    setSelectedEmployee(null);
    setHistory([]);

    return;
  }

  try {

    const res = await axios.get(
      `https://t2950f3p-5000.inc1.devtunnels.ms/messages/${sessionId}`
    );

    setHistory(res.data);

    setSelectedEmployee(employee);

  } catch (err) {

    console.log(err);

  }

};
const stopSession = async (
  sessionId
) => {

  try {

    await axios.put(
      `https://t2950f3p-5000.inc1.devtunnels.ms/stop-session/${sessionId}`
    );

    toast.success(
      "Chat stopped"
    );

  } catch (err) {

    toast.error(
      "Failed to stop chat"
    );

  }

};
const fetchChats = async () => {

  try {

    const res = await axios.get(
      "https://t2950f3p-5000.inc1.devtunnels.ms/all-messages"
    );

    const latestChats = [];

    const seen =
      new Set();

    res.data.reverse().forEach(
      (msg) => {

        if (
          !seen.has(msg.email)
        ) {

          latestChats.push({
            employee: msg.email,
            text: msg.content,
            session_id:
              msg.session_id,
          });

          seen.add(msg.email);

        }

      }
    );

    latestChats.sort((a, b) =>
  a.employee.localeCompare(
    b.employee
  )
);

setChats(latestChats);

  } catch (err) {

    console.log(err);

  }

};
  const deleteArticle = async (id) => {
    try {
      await axios.delete(
        `https://t2950f3p-5000.inc1.devtunnels.ms/kb/${id}`
      );

      toast.success("Article Deleted");

      fetchArticles();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const editArticle = (article) => {
    setEditId(article.id);
    setTitle(article.title);
    setContent(article.content);
  };

  const updateArticle = async () => {
    try {
      await axios.put(
        `https://t2950f3p-5000.inc1.devtunnels.ms/kb/${editId}`,
        {
          title,
          content,
        }
      );

      toast.success("Article Updated");

      setEditId(null);
      setTitle("");
      setContent("");

      fetchArticles();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          <div className="bg-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">

              <div className="bg-white/20 p-4 rounded-2xl text-3xl">
                <FaBook />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Admin Dashboard
                </h1>

                <p className="text-purple-100 mt-2">
                  Manage Knowledge Base Articles
                </p>
              </div>

            </div>
          </div>

          {/* FORM */}

          <div className="p-4 md:p-8 border-b border-gray-200">

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Article Title
                </label>

                <input
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="
                    mt-2
                    w-full
                    border border-gray-300
                    p-3
                    rounded-xl
                    outline-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-200
                    transition
                  "
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Article Content
                </label>

                <textarea
                  rows="4"
                  placeholder="Enter article content"
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  className="
                    mt-2
                    w-full
                    border border-gray-300
                    p-3
                    rounded-xl
                    outline-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-200
                    transition
                    resize-none
                  "
                ></textarea>
              </div>

            </div>

            <div className="mt-6">

              {editId ? (
                <button
                  onClick={updateArticle}
                  className="
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    flex items-center gap-2
                    transition
                    shadow-md
                  "
                >
                  <FaSave />
                  Update Article
                </button>
              ) : (
                <button
                  onClick={addArticle}
                  className="
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    flex items-center gap-2
                    transition
                    shadow-md
                  "
                >
                  <FaPlus />
                  Add Article
                </button>
              )}

            </div>

          </div>

          {/* TABLE */}

          <div className="p-4 md:p-8 overflow-x-auto">
            {/* SEARCH BAR */}

<div className="mb-6">

  <input
    type="text"
    placeholder="Search articles by title..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="
      w-full md:w-[350px]
      border border-gray-300
      p-3
      rounded-xl
      outline-none
      focus:border-purple-500
      focus:ring-2
      focus:ring-purple-200
      transition
    "
  />

</div>

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-purple-100 text-purple-700">
                  <th className="p-4 text-left rounded-l-xl">
                    ID
                  </th>

                  <th className="p-4 text-left">
                    Title
                  </th>

                  <th className="p-4 text-left">
                    Content
                  </th>

                  <th className="p-4 text-center rounded-r-xl">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                 {articles
                .filter((article) =>
                  article.title
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-200 hover:bg-purple-50 transition"
                  >

                    <td className="p-4 font-medium text-gray-700">
                      {article.id}
                    </td>

                    <td className="p-4 font-semibold text-gray-800">
                      {article.title}
                    </td>

                    <td className="p-4 text-gray-600 max-w-md">
                      {article.content}
                    </td>

                    <td className="p-4">

                      <div className="flex items-center justify-center gap-3">

                        <button
                          onClick={() =>
                            editArticle(article)
                          }
                          className="
                            bg-purple-100
                            text-purple-600
                            p-3
                            rounded-lg
                            hover:bg-purple-200
                            transition
                          "
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() =>
                            deleteArticle(article.id)
                          }
                          className="
                            bg-red-100
                            text-red-600
                            p-3
                            rounded-lg
                            hover:bg-red-200
                            transition
                          "
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* LIVE MONITORING */}

<div className="border-t border-gray-200 p-4 md:p-8 bg-purple-50">

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-purple-700">
      Live Employee Monitoring
    </h2>

    <p className="text-gray-500 mt-2">
      Real-time employee conversations
    </p> 


  

</div>

 

  <div className="space-y-4">

    {chats.length === 0 ? (

      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">

        <p className="text-gray-500">
          No live chats yet
        </p>

      </div>

    ) : (

  chats.map((chat, index) => (

  <div
    key={index}
    className="
      bg-white
      rounded-2xl
      p-5
      shadow-md
      border border-purple-100
    "
  >

    <div
      className="
        flex flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        mb-4
      "
    >

      <div>

        
        <div className="flex items-center gap-3">

  <span
    className={`
      w-3 h-3 rounded-full
      ${
        onlineEmployees.includes(
          chat.employee
        )
          ? "bg-green-500"
          : "bg-red-500"
      }
    `}
  ></span>

  <p className="font-semibold text-purple-700">

    {chat.employee}

  </p>

  <span
    className={`
      text-sm font-medium
      ${
        onlineEmployees.includes(
          chat.employee
        )
          ? "text-green-600"
          : "text-red-600"
      }
    `}
  >

    {onlineEmployees.includes(
      chat.employee
    )
      ? "Online"
      : "Offline"}

  </span>

</div>
      

        <div className="mt-3">

  <p className="text-xs text-gray-400 uppercase">

    Latest Message

  </p>

  <p className="text-gray-700 mt-1">

    {chat.text}

  </p>

</div>

      </div>

       <div className="flex flex-wrap gap-3">
<button
  onClick={() =>
    fetchSessions(
      chat.employee
    )
  }
  className="
    bg-purple-500
    hover:bg-purple-600
    text-white
    px-4 py-2
    rounded-lg
    text-sm
    transition
  "
>

  <div className="flex items-center gap-2">

    <FaHistory />

    View Sessions

  </div>

</button>
        <button
  onClick={() =>
    stopSession(
      chat.session_id
    )
  }
  disabled={chat.stopped}
  className={`
    ${
      chat.stopped
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }
    text-white
    px-4 py-2
    rounded-lg
    text-sm
    transition
  `}
>

  <div className="flex items-center gap-2">

    <FaBan />

    {
      chat.stopped
        ? "Chat Disabled"
        : "Stop Chat"
    }

  </div>

</button>

      </div>

    </div>

    {selectedEmployee ===
      chat.employee && (

      <div
        className="
          mt-4
          bg-purple-50
          rounded-2xl
          p-5
          border border-purple-100
        "
      >

        <h3
          className="
            text-lg
            font-bold
            text-purple-700
            mb-4
          "
        >

          Recent Chat History

        </h3>

        <div className="space-y-3">
          <div className="space-y-2 mb-4">

  {sessions.map((session) => (

    <button
      key={session.id}
      onClick={() =>
        fetchHistory(
          session.id,
          chat.employee
        )
      }
      className="
        bg-white
        px-4 py-2
        rounded-lg
        shadow-sm
        border
        border-purple-100
        hover:bg-purple-100
        transition
        w-full
        text-left
        break-words
      "
    >

      <div>

  <p className="font-medium text-gray-700">

    {
      session.first_message ||
      "New Conversation"
    }

  </p>

  <p className="text-xs text-gray-400 mt-1">

    {new Date(
      session.created_at
    ).toLocaleString()}

  </p>

</div>

    </button>

  ))}

</div>

          {history.map((msg, i) => (

            <div
              key={i}
              className="
                bg-white
                p-4
                rounded-xl
                shadow-sm
              "
            >

              <p className="font-semibold text-purple-700">

                {msg.sender}

              </p>

              <p className="text-gray-700 mt-1">

                {msg.content}

              </p>

            </div>

          ))}

        </div>

      </div>

    )}

  </div>

))

    
    )}

  </div>

</div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
