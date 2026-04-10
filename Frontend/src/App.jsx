import React, { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./pages/landingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";

export default function App() {

  const [loaded, setLoaded] = useState(false);

    if (!loaded) {
    return <SplashScreen onFinish={() => setLoaded(true)} />;
  }



  return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
    </>
  );
}
