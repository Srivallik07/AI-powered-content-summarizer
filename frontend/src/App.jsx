import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
}

export default App;
