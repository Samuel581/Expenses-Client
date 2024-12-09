//import HelloReact from './pages/HelloReact'
import Login from "./pages/Login";
import Expenses from "./pages/Expenses";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import SpendingTrends from "./pages/SpendingTrends";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/trends" element={<SpendingTrends/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;
