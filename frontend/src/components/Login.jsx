import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { apiUrl } from "../config";
import { useGoogleLogin } from "@react-oauth/google";

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

  const googleLoginTrigger = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid profile email',
    // Use popup/implicit flow so we receive an access token in the client
    // then POST it to the backend endpoint which can verify it via Google userinfo.
    onSuccess: async (response) => {
      setLoading(true);
      setError("");
      try {
        const token = response?.access_token || response?.credential;
        if (!token) throw new Error('No token received from Google');

        const { data } = await axios.post(
          apiUrl('/user/google-login'),
          { token },
          { withCredentials: true }
        );

        const normalizedUser = {
          ...data.user,
          id: data.user?.id || data.user?._id || null,
          _id: data.user?.id || data.user?._id || null,
        };

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
        localStorage.setItem('token', data.token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        setAuthUser(data.token);
        navigate('/dashboard');
      } catch (err) {
        let msg = 'Google sign in failed';
        if (err?.response?.data?.error?.message) msg = err.response.data.error.message;
        else if (err?.message) msg = err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign in failed'),
  });

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
          <button
            type="button"
            onClick={() => googleLoginTrigger()}
            className="w-full inline-flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg transition hover:brightness-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-5 h-5">
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h147.1c-6.4 34.8-25.1 64.3-53.6 84v69h86.6c50.6-46.6 81.4-115.3 81.4-198z"/>
              <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.4 180.6-66.3l-86.6-69c-24.1 16.2-54.9 25.9-94 25.9-72 0-133-48.6-154.8-114.1H30.1v71.6C75.9 483.3 167.7 544.3 272 544.3z"/>
              <path fill="#FBBC05" d="M117.2 323.8c-10.9-32.2-10.9-66.9 0-99.1V153.1H30.1c-39.6 79.3-39.6 172.9 0 252.2l87.1-81.5z"/>
              <path fill="#EA4335" d="M272 107.7c39.6 0 75 13.6 103 40.4l77.2-77.2C407.4 24.5 345.6 0 272 0 167.7 0 75.9 60.9 30.1 153.1l87.1 71.6C139 156.3 200 107.7 272 107.7z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
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
