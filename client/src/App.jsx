
import { BrowserRouter as Router ,Route, Routes, Link } from "react-router-dom";
import Login from "./components/login.component";
import LoggedIn from "./components/loggedin.component";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {


  return (<Router>
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <Link className="navbar-brand" to={"/sign-in"}>Verus Login Template</Link>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to={"/sign-in"}>Login</Link>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-inner">
          <Routes>
            <Route path='/' element={<Login/>} />
            <Route path='/loggedin' element={<LoggedIn/>} />
          </Routes>
        </div>
        <ToastContainer position="bottom-left"/>
      </div>
    </div></Router>
  );
}

export default App;