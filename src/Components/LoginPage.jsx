import { Button, TextField } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMetaMask from "../hooks/useMetaMask";
import Tag from "./Tag";

const LoginPage = () => {
  const navigate = useNavigate();
  const moveTo = () => navigate("register");

  const [loading, setLoading] = useState(false);
  const [logInStatus, setLogInStatus] = useState({
    message: "",
    severity: "",
    key: 0,
  });
  const [data, setData] = useState({ email: "", password: "" });
  const { connectWallet } = useMetaMask();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const login = async () => {
    const headers = { "Content-Type": "application/json" };
    try {
      setLoading(true);
      const response = await axios.post(
        "https://chat-world-backend-9ihy.onrender.com/user/login",
        data,
        { headers }
      );
      const { user, token, requiresWallet } = response.data;

      if (requiresWallet) {
        const walletAddress = await connectWallet();
        if (walletAddress) {
          await axios.post("https://chat-world-backend-9ihy.onrender.com/user/updateWallet", {
            userId: user._id,
            walletAddress,
          });
          user.walletAddress = walletAddress;
        }
      }

      setLogInStatus({
        message: "User logged in successfully",
        severity: "success",
        key: Math.random(),
      });

      localStorage.setItem("userdata", JSON.stringify({ user, token }));
      navigate("app/open-page");
    } catch (err) {
      setLogInStatus({
        message: err.response?.data?.error || "Login Failed",
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
        <p className="login-title">Login In The Chart World</p>
        <TextField
          id="email"
          name="email"
          label="Enter Email"
          variant="standard"
          value={data.email}
          onChange={handleInputChange}
        />
        <TextField
          id="password"
          name="password"
          label="Enter Password"
          type="password"
          variant="standard"
          value={data.password}
          onChange={handleInputChange}
        />
        <Button onClick={login} variant="contained" disabled={loading}>
          {loading ? "Logging In....." : "Log In"}
        </Button>
        <Backdrop
          sx={(theme) => ({
            color: "#fff",
            zIndex: theme.zIndex.drawer + 1,
          })}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Tag
          message={logInStatus.message}
          severity={logInStatus.severity}
          uniqueKey={logInStatus.key}
        />
        <Button onClick={moveTo}>
          Not Registered?{" "}
          <p
            style={{
              margin: "1rem",
              textDecoration: "underline",
              color: "green",
            }}
          >
            Register
          </p>
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
