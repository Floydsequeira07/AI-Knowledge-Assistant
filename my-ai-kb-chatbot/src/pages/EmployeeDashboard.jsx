import {
  useEffect,
  useState,
  useRef,
} from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaUserCircle,FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );
  const logout = () => {

  socket.emit("employee_offline", {
    email: user.email,
  });

  localStorage.removeItem("user");

  navigate("/");

};
  const [sessionId, setSessionId] =
  useState(null);
  const [message, setMessage] = useState("");
  const [sessions, setSessions] =
  useState([]);
  const [newChatMode,
setNewChatMode] =
useState(false);
  const messagesEndRef =
  useRef(null);
  
 useEffect(() => {

  socket.emit("employee_online", {
    email: user.email,
  });

}, []);
useEffect(() => {

  fetchSessions();

  const interval =
    setInterval(() => {

      fetchSessions();

    }, 1000);

  return () =>
    clearInterval(interval);

}, []);




const createSession = async () => {

  try {

    const res = await axios.post(
      "https://t2950f3p-5000.inc1.devtunnels.ms/session",
      {
        employee_id: user.id,
      }
    );

    setSessionId(res.data.sessionId);
    
    await fetchSessions();

  } catch (err) {

    console.log(err);

  }

};

const fetchSessions =
  async () => {

    try {

      const res =
        await axios.get(
          `https://t2950f3p-5000.inc1.devtunnels.ms/employee-sessions/${user.email}`
        );

      setSessions(res.data);
      



    } catch (err) {

      console.log(err);

    }

  };

  const loadSession =
  async (id) => {

    try {

      const res =
        await axios.get(
          `https://t2950f3p-5000.inc1.devtunnels.ms/messages/${id}`
        );

      setSessionId(id);

      const formatted =
        res.data.map(
          (msg) => ({
            sender:
              msg.sender ===
              "employee"
                ? "user"
                : "bot",

            text:
              msg.content,
          })
        );

      setMessages(
        formatted
      );

    } catch (err) {

      console.log(err);

    }

  };
  const [messages, setMessages] =
  useState([]);
  useEffect(() => {

  if (
  sessions.length > 0 &&
  !sessionId &&
  !newChatMode
) {

    loadSession(
      sessions[0].id
    );

  }

}, [sessions]);


 const sendMessage = async () => {

  if (!message.trim()) return;
  let activeSessionId =
  sessionId;

if (!activeSessionId) {

  const res =
    await axios.post(
      "https://t2950f3p-5000.inc1.devtunnels.ms/session",
      {
        employee_id:
          user.id,
      }
    );

  activeSessionId =
    res.data.sessionId;

  setSessionId(
    activeSessionId
  );
  setNewChatMode(false);

  setSessions((prev) => [

    {
      id: activeSessionId,
      first_message:
        message,
      stopped: false,
    },

    ...prev,

  ]);

}


  const userMessage = {
    sender: "user",
    text: message,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);
  setSessions((prev) =>

  prev.map((session) =>

    session.id === activeSessionId

      ? {
          ...session,
          first_message:
            session.first_message ||
            message,
        }

      : session

  )

);
socket.emit("new_message", {
  session_id:
  activeSessionId,
  sender: "employee",
  employee: user.email,
  text: message,
});
  try {

     const res = await axios.post(
  "https://t2950f3p-5000.inc1.devtunnels.ms/chat",
  {
    message,
    session_id:
  activeSessionId,
  }
);

    const botMessage = {
      sender: "bot",
      text: res.data.reply,
    };

    let currentText = "";

const words =
  res.data.reply.split(" ");

const tempMessage = {
  sender: "bot",
  text: "",
};

setMessages((prev) => [
  ...prev,
  tempMessage,
]);

words.forEach((word, index) => {

  setTimeout(() => {

    currentText +=
      word + " ";

    setMessages((prev) => {

      const updated = [...prev];

      updated[
        updated.length - 1
      ] = {
        sender: "bot",
        text: currentText,
      };

      return updated;

    });

  }, index * 120);

});

  } catch (err) {

    const errorMessage = {
      sender: "bot",
      text:
        "Something went wrong.",
    };

    setMessages((prev) => [
      ...prev,
      errorMessage,
    ]);

  }

  setMessage("");
  fetchSessions();

};


    useEffect(() => {

  messagesEndRef.current
    ?.scrollIntoView({
      behavior: "smooth",
    });

}, [messages]);
    

    

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4 md:p-8">
      
      <div
  className="
    max-w-7xl
    mx-auto
    flex
    flex-col
    md:flex-row
    gap-6
  "
>  
<div
  className="
    w-full
    md:w-[300px]
    bg-white
    rounded-3xl
    shadow-2xl
    p-5
    h-fit
  "
>
  <button
  onClick={() => {

  setSessionId(null);

  setMessages([]);

  setNewChatMode(true);

}}
  className="
    w-full
    mb-4
    bg-purple-600
    hover:bg-purple-700
    text-white
    py-2
    rounded-xl
    transition
    text-sm
    font-medium
  "
>

  + New Chat

</button>

  <h2
  className="
    text-lg
    font-bold
    text-gray-700
    mb-4
  "
>

  Recent Chats

</h2>


  <div className="space-y-3">

    {sessions.map(
      (session) => (

        <button
          key={session.id}
          onClick={() =>
            loadSession(
              session.id
            )
          }
          className={`
  w-full
  text-left
  p-3
  rounded-xl
  border
  transition

  ${
    sessionId === session.id
      ? "bg-purple-100 border-purple-400"
      : "border-purple-100 hover:bg-purple-50"
  }
`}
        >

          <p
            className="
              text-sm
              font-medium
              text-gray-700
            "
          >

            {
              session.first_message
  ? session.first_message.slice(
      0,
      35
    )
  : "New Chat"
            }

          </p>
         

<p
  className={`
    text-xs
    mt-2
    font-medium

    ${
      session.stopped
        ? "text-red-500"
        : "text-green-500"
    }
  `}
>

  {
    session.stopped
      ? "Stopped"
      : "Active"
  }

</p>

        </button>

      )
    )}

  </div>

</div>

        {/* HEADER */}

        <div
  className="
    bg-white
    rounded-3xl
    shadow-2xl
    overflow-hidden
    flex
    flex-col
    h-[90vh]
    flex-1
  "
>

          <div
  className="
    bg-purple-600
    text-white
    p-4 md:p-8
    flex
    flex-col
    md:flex-row
    md:items-center
    md:justify-between
    gap-4
  "
>

            <div className="flex items-center gap-3 md:gap-4">

              <div className="bg-white/20 p-3 md:p-4 rounded-2xl text-2xl md:text-3xl">
                <FaRobot />
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Employee Dashboard
                </h1>

                <p className="text-purple-100 mt-2">
                  AI Knowledge Base Chatbot
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

  <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl">

    <FaUserCircle className="text-2xl" />

    <div>
      <p className="font-semibold">
        {user?.email}
      </p>

      <p className="text-sm text-purple-100">
        Employee
      </p>
    </div>

  </div>

  <button
    onClick={logout}
    className="
      bg-white/20
      hover:bg-white/30
      p-3
      rounded-xl
      transition
      text-xl
    "
  >

    <FaSignOutAlt />

  </button>

</div>
</div>
          {/* CHAT AREA */}

          <div
  className="
    flex-1
    p-4
    md:p-8
    overflow-y-auto
    bg-purple-50
  "
>

            <div className="space-y-5">
              {messages.length === 0 && (

  <div className="flex justify-start">

    <div
      className="
        max-w-[90%]
        md:max-w-[70%]
        px-5
        py-3
        rounded-2xl
        shadow-md
        text-sm
        leading-6
        bg-white
        text-gray-700
        rounded-bl-sm
      "
    >

      <p
        className="
          text-xs
          font-semibold
          mb-1
          opacity-70
        "
      >

        Assistant

      </p>

      <p>
        How can I assist you today?
      </p>

    </div>

  </div>

)}

              {messages.map((msg, index) => (

              
                <div
                  key={index}
                  className={`
                    flex
                    ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-[90%] md:max-w-[70%]
                      px-5
                      py-3
                      rounded-2xl
                      shadow-md
                      text-sm
                      leading-6
                      ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white rounded-br-sm"
                          : "bg-white text-gray-700 rounded-bl-sm"
                      }
                    `}
                  >

                    <div>

  <p
    className="
      text-xs
      font-semibold
      mb-1
      opacity-70
    "
  >

    {
      msg.sender === "user"
        ? "Employee"
        : "Assistant"
    }

  </p>

  <p>
    {msg.text}
  </p>

</div>

                  </div>

                </div>

              ))}
            
              

            </div>

          </div>

          {/* INPUT AREA */}

          <div className="p-4 md:p-6 border-t border-gray-200 bg-white">

            <div className="flex gap-3 md:gap-4">

              <input
                type="text"
                placeholder="Ask something..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="
                  flex-1
                  border border-gray-300
                  p-4
                  rounded-xl
                  outline-none
                  focus:border-purple-500
                  focus:ring-2
                  focus:ring-purple-200
                  transition
                "
              />

              <button
                onClick={sendMessage}
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  px-6
                  rounded-xl
                  transition
                  shadow-md
                  flex items-center justify-center
                  text-xl
                "
              >

                <FaPaperPlane />

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
export default EmployeeDashboard;