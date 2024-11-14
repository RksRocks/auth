// src/components/Login.js
import { useState } from "react";
import axios from "axios";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config/AuthLoggerConfig";
import { Link, useNavigate } from "react-router-dom";
import metamasks from "../assets/metamask-icon (1).png";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [code, setCode] = useState("");
  const [is2FA, setIs2FA] = useState(false);
  const history = useNavigate();

  const handleMetaMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      const log = await logLoginAttempt("Successful");
      const serializedLog = JSON.parse(
        JSON.stringify(log[1], (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      const response = await axios.post(
        "https://nextgenauth.onrender.com/api/auth/metamasklogin",
        { account: log[0], dataa: serializedLog }
      );

      if (response.data.message == "Login successful using meteamask") {
        history("/metamask-login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
     
      alert(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const log = await logLoginAttempt("Successful");
      const serializedLog = JSON.parse(
        JSON.stringify(log[1], (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      const response = await axios.post(
        "https://nextgenauth.onrender.com/api/auth/login",
        { email, password, account: log[0], dataa: serializedLog }
      );

      if (response.data.userId) {
        setIs2FA(true);
      } else {
        history("/auth-less-login");
      }
    } catch (error) {
      
      alert(error.message);
    }
  };

  // Move `logLoginAttempt` function to the frontend (Login.js)
  const logLoginAttempt = async (status) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" }); // Request account access

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const authLoggerContract = new web3.eth.Contract(
          contractABI,
          contractAddress
        );

        // Call the recordLogin function on the smart contract with the status argument
        const data = await authLoggerContract.methods.recordLogin(status).send({
          from: account,
          gas: 200000, // Adjust gas limit as needed
          gasPrice: web3.utils.toWei("30", "gwei"),
        });

        console.log("Login attempt logged successfully.");
        return [account, data];
      } catch (error) {
        console.error("Error logging login attempt:", error);
        alert(`Failed to log login attempt: ${error.message}`);
        return null; // Return null to indicate an error occurred
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
      return null; // Return null if MetaMask is not available
    }
  };

  // Function to log login attempt on the blockchain

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://nextgenauth.onrender.com/api/auth/verify2fa",
        { email, code, rememberMe }
      );
      alert(response.data.message);
      setIs2FA(false);
      setCode("");

      history("/auth-login");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
        {is2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 2FA Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-600">Remember Me</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Verify 2FA
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Login
              </button>
            </form>
            <p className="text-black font-semibold">or</p>
            <form onSubmit={handleMetaMarksSubmit}>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg flex justify-center items-center  bg-transparent border-2 border-orange-600"
              >
                <img src={metamasks} alt="" className="w-7 h-7" />
              </button>
            </form>
            <p className="text-black font-semibold">or</p>
            <Link
              to="/signup"
              className="w-full flex py-2 text-center justify-center items-center text-blue-600 font-bold rounded-lg border-2 border-blue-600"
            >
              SignUp
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
