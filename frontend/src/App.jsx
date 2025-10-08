import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import { AuthProvider } from "./context/AuthContext";

//pages
import Home from "./pages/Home"
import NavBar from "./components/NavBar"
import Exam from "./pages/StartExam";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import PageNotFound from "./pages/PageNotFound";
import CreateExam from "./pages/CreateExam";
import TeacherDashboard from "./pages/Dashboard";

function AppContent(){
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/exam" element={<Exam />} />
      <Route path="/create-exam" element={<CreateExam />} />
      <Route path="/dashboard" element={<TeacherDashboard />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <main>
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
        </main>
      </Router>
    </AuthProvider>
  )
}

export default App
