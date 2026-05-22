import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { apiUrl } from "../config";
import { GoogleLogin } from "@react-oauth/google";

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [, setAuthUser] = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authToken = params.get("authToken");

    if (!authToken) {
      return;
    }

    const authUserRaw = params.get("authUser");
    const normalizedToken = authToken.trim();

    try {
      const parsedUser = authUserRaw ? JSON.parse(authUserRaw) : null;
      if (parsedUser) {
        const normalizedUser = {
          ...parsedUser,
          id: parsedUser.id || parsedUser._id || null,
          _id: parsedUser.id || parsedUser._id || null,
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
      }
    } catch {
      // Ignore malformed redirect state and continue with the token.
    }

    localStorage.setItem("token", normalizedToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, normalizedToken);
    setAuthUser(normalizedToken);
    navigate("/dashboard", { replace: true });
  }, [location.search, navigate, setAuthUser]);


  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        apiUrl("/user/login"),
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );
      const normalizedUser = {
        ...data.user,
        id: data.user?.id || data.user?._id || null,
        _id: data.user?.id || data.user?._id || null,
      };
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", data.token);
      setAuthUser(data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      navigate("/dashboard");
    } catch (error) {
        let msg = "Login failed";
      
        if (error?.response?.data?.error?.details) {
          // Validation errors
          msg = Object.entries(error.response.data.error.details)
            .map(([field, detail]) => `${field}: ${detail.message}`)
            .join('; ');
        } else if (error?.response?.data?.error?.message) {
          msg = error.response.data.error.message;
        } else if (error?.message) {
          msg = error.message;
        }
      
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-[#1e1e1e] text-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        {/* Heading */}
        <h1 className="text-white items-center justify-center text-center">
          Login
        </h1>

        {/* email */}
        <div className="mb-4 mt-2">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type="text"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* password */}
        <div className="mb-4 mt-2 relative">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
          />
          <span className=" absolute right-3 top-3 text-gray-400">
            {" "}
            <Eye size={18} />{" "}
          </span>
        </div>

        {/* Error Message */}
        {error && <span className="text-red-600 text-sm mb-4">{error}</span>}
        
          {/* Success Message */}
          <div className="mb-4 text-sm text-gray-300">
            {loading && <span>Please wait...</span>}
          </div>

        {/* Terms & Condition */}
        <p className="text-xs text-gray-400 mt-4 mb-6">
          By signing up or logging in, you consent to Synapse AI{" "}
          <a className="underline" href="#" onClick={(e) => e.preventDefault()}>
            Terms of Use
          </a>{" "}
          and{" "}
          <a className="underline" href="#" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>{" "}
          .
        </p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className=" w-full bg-[#7a6ff6] hover:bg-[#6c61a6] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "logging in... " : "Login"}
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-700" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-gray-700" />
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            ux_mode="redirect"
            login_uri={apiUrl("/user/google-login")}
            theme="filled_blue"
            text="signin_with"
            shape="rectangular"
            size="large"
            width="360"
          />
        </div>

        {/* Links */}
        <div className="flex justify-between mt-4 text-sm">
          <Link className="text-[#7a6ff6] hover:underline" to="/signup">
            Haven't account?
          </Link>
          <Link className="text-[#7a6ff6] hover:underline" to={"/signup"}>
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
