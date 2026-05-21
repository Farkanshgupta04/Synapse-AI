import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome";
import { useAuth } from "./context/AuthProvider";

function App() {
  const [authUser] = useAuth();
  return (
    <>
      <div>
        <Routes>
          <Route
            path="/"
            element={<Welcome />}
          />
          <Route
            path="/dashboard"
            element={authUser ? <Home /> : <Navigate to={"/"} />}
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to={"/dashboard"} /> : <Login />}
          />
          <Route
            path="/signup"
            element={authUser ? <Navigate to={"/dashboard"} /> : <Signup />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;