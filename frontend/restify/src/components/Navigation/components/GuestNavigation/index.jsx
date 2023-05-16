import Nav from 'react-bootstrap/Nav';
import { NavLink } from "react-router-dom";

function GuestNavigation(props) {
  return <Nav className="me-auto">
    <Nav.Item><NavLink className="nav-link" to={"/login"}>Login</NavLink></Nav.Item>
    <Nav.Item><NavLink className="nav-link" to={"/register"}>Register</NavLink></Nav.Item>
  </Nav>
}

export default GuestNavigation;