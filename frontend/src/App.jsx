import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ExamProvider } from "./context/ExamContext";
import { TeacherProvider } from "./context/TeacherContext";

//pages
import Home from "./pages/Home"
import NavBar from "./components/NavBar"
import StartExam from "./pages/student/StartExam";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import PageNotFound from "./pages/PageNotFound";
import CreateExam from "./pages/teacher/CreateExam";
import TeacherDashboard from "./pages/teacher/Dashboard";
import StudentDetailsFilling from "./pages/student/StudentDetailsFilling";
import ExamSection from "./pages/student/ExamSection";
import ThankYou from "./pages/ThankYou";
import Evalvate from "./pages/teacher/Evalvate";
import ViewPaper from "./pages/teacher/ViewPaper";

function MainLayout() {
  return (
    <>
      <NavBar />
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </>
  );
}

function MinimalLayout() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/exam" element={<StartExam />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/evaluation/:examId" element={<Evalvate />} />
        <Route path="/teacher/evalvate/:examId/:studentId" element={<ViewPaper />} />
      </Route>

      <Route element={<MinimalLayout />}>
        <Route path="/exam/student/details" element={<StudentDetailsFilling />} />
        <Route path="/exam/student/section" element={<ExamSection />} />
        <Route path="/thank-you/:name" element={<ThankYou />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

function App() {

  return (
    <AuthProvider>
      <ExamProvider>
        <TeacherProvider>
          <Router>
            <AppContent />
          </Router>
        </TeacherProvider>
      </ExamProvider>
    </AuthProvider>
  )
}

export default App
