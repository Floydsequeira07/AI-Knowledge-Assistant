import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");
const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const options = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Admin" },
];
const validate = () => {
  let valid = true;

  setEmailError("");
  setPasswordError("");

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    setEmailError("Email is required");
    valid = false;
  } else if (!emailRegex.test(email)) {
    setEmailError("Invalid email format");
    valid = false;
  }

  if (!password) {
    setPasswordError("Password is required");
    valid = false;
  }

  return valid;
};

  const handleLogin = async () => {
     if (!validate()) return;
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("user", JSON.stringify(res.data));

       toast.success(
  `${res.data.role} login successful`
);

setTimeout(() => {
  if (res.data.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/employee");
  }
}, 1500);
    } catch (err) {
      toast.error("Invalid Credentials");
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center px-6">
        <Toaster position="top-right" />
      
      <div className="flex w-[760px] bg-white rounded-3xl overflow-hidden shadow-2xl">

  {/* LEFT SIDE */}

  <div className="w-[320px] bg-purple-600 text-white p-10 flex flex-col justify-center relative overflow-hidden">

    <div className="absolute top-10 left-10 w-40 h-40 bg-purple-400 rounded-full opacity-30 blur-3xl"></div>

    <div className="absolute bottom-10 right-10 w-52 h-52 bg-pink-400 rounded-full opacity-20 blur-3xl"></div>

    <div className="relative z-10">

      <div className="text-5xl mb-6 animate-bounce">
        🤖
      </div>

      <h1 className="text-2xl font-bold mb-4">
        AI Knowledge Assistant
      </h1>

      <p className="text-sm text-purple-100 leading-6">
        Build an AI-Powered Knowledge Base
        Chatbot with Real-Time
         Admin Monitoring.
      </p>

      <div className="mt-8 space-y-3">

        <div className="bg-white/20 p-2 rounded-lg text-sm backdrop-blur-sm">
          💬 Realtime AI Chat
        </div>

        <div className="bg-white/20 p-2 rounded-lg text-sm backdrop-blur-sm">
          📚 Knowledge Base Powered
        </div>

        <div className="bg-white/20 p-2 rounded-lg text-sm backdrop-blur-sm">
          👨‍💼 Admin Monitoring
        </div>

      </div>

    </div>

  </div>

  {/* RIGHT SIDE */}

     <div className="flex-1 p-10 pt-16">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
  Login to continue to your dashboard
</p>

        <div className="flex flex-col gap-4 ">
             <Select
  options={options}
  defaultValue={options[0]}
  onChange={(selectedOption) =>
    setRole(selectedOption.value)
  }
  styles={{
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused
      ? "#a855f7"
       : "#d1d5db",

    boxShadow: state.isFocused
      ? "0 0 0 2px #e9d5ff"
      : "none",

    "&:hover": {
      borderColor: "#a855f7",
    },

    padding: "6px",
    borderRadius: "10px",
    outline: "none",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#a855f7"
      : state.isFocused
      ? "#f3e8ff"
      : "white",

    color: state.isSelected
      ? "white"
      : "black",

    cursor: "pointer",
  }),
}}
/>

          <input
            type="email"
            placeholder="Enter Email"
            className="border border-gray-300 p-3 rounded-lg outline-none focus:border-purple-500 focus:ring-2
      focus:ring-purple-200
      transition
      w-full
      pr-12 "
            onChange={(e) => setEmail(e.target.value)}
          />
           {emailError && (
    <p className="text-red-500 text-sm mt-1">
      {emailError}
    </p>
  )} 
   <div className="relative">

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter Password"
    className="
      border border-gray-300
      p-3
      rounded-lg
      outline-none
      focus:border-purple-500
      focus:ring-2
      focus:ring-purple-200
      transition
      w-full
      pr-12
    "
    onChange={(e) => setPassword(e.target.value)}
  />

  <div
    className="
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      cursor-pointer
      text-gray-500
    "
    onClick={() =>
      setShowPassword(!showPassword)
    }
  >
    {showPassword ? (
      <FaEyeSlash />
    ) : (
      <FaEye />
    )}
  </div>

</div>


{passwordError && (
  <p className="text-red-500 text-sm mt-1">
    {passwordError}
  </p>
)}

  

         

          <button
            onClick={handleLogin}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition shadow-md hover:shadow-lg"
          >
            Login
          </button>

        </div>
      </div>
</div>
    </div>
  );
}

export default Login;