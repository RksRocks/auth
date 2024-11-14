import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import "./App.css";
import SignUp from "./components/SignUp";
import AuthLogin from "./components/AuthLogin";
import AuthlessLogin from "./components/AuthlessLogin";
import Home from "./components/Home";
import MetamaskLogin from "./components/MetamaskLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-login" element={<AuthLogin />} />
        <Route path="/auth-less-login" element={<AuthlessLogin />} />
        <Route path="/metamask-login" element={<MetamaskLogin />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
