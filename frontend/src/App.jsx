import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TaskList from './components/Tasks/TaskList';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { useState, useEffect } from 'react';
import { getTasks } from './services/api';

// Wrapper to pass tasks to Dashboard
const DashboardWrapper = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTasks();
        // Fix: Access nested data structure { success: true, data: { tasks: [] } }
        setTasks(res.data.data?.tasks || []);
      } catch (err) {
        console.error(err);
        setTasks([]); // Safety fallback
      }
    };
    fetch();
  }, []);

  return <Dashboard tasks={tasks} />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideHeader = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app">
      {!hideHeader && <Header />}
      <main className={hideHeader ? 'auth-main' : 'main-content'}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TaskList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardWrapper />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
