import { Button, TextField } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMetaMask from "../hooks/useMetaMask";
import Tag from "./Tag";

const RegisterPage = () => {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState({
    message: "",
    severity: "",
    key: 0,
  });
  const { account, connectWallet } = useMetaMask();
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const registration = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      const response = await axios.post(
        "https://chat-world-backend-9ihy.onrender.com/user/register",
        { ...data, walletAddress: account },
        { headers }
      );
      const { user, token } = response.data;

      setRegisterStatus({
        message: "User Registered Successfully",
        severity: "success",
        key: Math.random(),
      });

      // Save the full user object including _id
      localStorage.setItem(
        "userdata",
        JSON.stringify({ user, token })
      );

      navigate("/app/open-page");
    } catch (err) {
      setRegisterStatus({
        message: err.response?.data?.error || "Registration Failed",
        severity: "error",
        key: Math.random(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginPage-container">
      <div className="Login-left">
        <img
          src="./src/Images/login-page.gif"
          alt="login-img"
          className="login-page-img"
        />
      </div>
      <div className="Login-right">
        <p className="login-title">Register The Chart World</p>
        <TextField
          id="name"
          name="name"
          label="Enter Name"
          variant="standard"
          value={data.name}
          onChange={handleInput}
        />
        <TextField
          id="email"
          name="email"
          label="Enter Email"
          variant="standard"
          value={data.email}
          onChange={handleInput}
        />
        <TextField
          id="password"
          name="password"
          label="Enter Password"
          type="password"
          variant="standard"
          value={data.password}
          onChange={handleInput}
        />

        <Button
          onClick={connectWallet}
          variant="outlined"
          style={{ marginBottom: "1rem" }}
        >
          {account ? `Wallet: ${account}` : "Connect Wallet"}
        </Button>

        <Button onClick={registration} variant="contained" disabled={loading}>
          {loading ? "Registering....." : "Register"}
        </Button>

        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Tag
          message={registerStatus.message}
          severity={registerStatus.severity}
          uniqueKey={registerStatus.key}
        />
        <Button onClick={() => navigate("/")}>
          Registered?{" "}
          <span
            style={{
              margin: "1rem",
              textDecoration: "underline",
              color: "green",
            }}
          >
            Log in
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
