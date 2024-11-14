import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config/AuthLoggerConfig";
import metamasks from "../assets/metamask-icon (1).png";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://nextgenauth.onrender.com/api/auth/signup",
        {
          email,
          password,
        }
      );
      if (response.data.message == "User registered successfully")
        history("/login");

      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message || "Error signing up");
    }
  };

  const handleMetaMaskSignUp = async (e) => {
    e.preventDefault();
    try {
      const log = await logSignUpAttempt("Successful");
      const serializedLog = JSON.parse(
        JSON.stringify(log[1], (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      const response = await axios.post(
        "https://nextgenauth.onrender.com/api/auth/metamasksignup",
        {
          account: log[0],
          dataa: serializedLog,
        }
      );
      if (response.data.message == "User registered successfully")
        history("/login");

      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message || "Error signing up");
    }
  };

  const logSignUpAttempt = async (status) => {
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

        console.log("trxn successfully.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Sign Up
        </h1>
        <form onSubmit={handleSignUp} className="space-y-4">
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
            Sign Up
          </button>
        </form>
        <p className="text-black font-semibold">or</p>
        <form onSubmit={handleMetaMaskSignUp}>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg flex justify-center items-center  bg-transparent border-2 border-orange-600"
          >
            <img src={metamasks} alt="" className="w-7 h-7" />
          </button>
        </form>
        <p className="text-black font-semibold">or</p>
        <Link
          to="/login"
          className="w-full flex py-2 text-center justify-center items-center text-blue-600 font-bold rounded-lg border-2 border-blue-600"
        >
          SignIn
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
