import { useEffect, useState } from "react";
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
  
 useEffect(() => {

  socket.emit("employee_online", {
    email: user.email,
  });

}, []);
useEffect(() => {

  createSession();

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

  } catch (err) {

    console.log(err);

  }

};
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello! How can I help you today?",
    },
  ]);

 const sendMessage = async () => {

  if (!message.trim()) return;

  const userMessage = {
    sender: "user",
    text: message,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);
socket.emit("new_message", {
  session_id: sessionId,
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
      sessionId,
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

};;

    
    

    

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          <div className="bg-purple-600 text-white p-8 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="bg-white/20 p-4 rounded-2xl text-3xl">
                <FaRobot />
              </div>

              <div>

                <h1 className="text-3xl font-bold">
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

          <div className="p-8 h-[500px] overflow-y-auto bg-purple-50">

            <div className="space-y-5">

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
                      max-w-[70%]
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

                    {msg.text}

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* INPUT AREA */}

          <div className="p-6 border-t border-gray-200 bg-white">

            <div className="flex gap-4">

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