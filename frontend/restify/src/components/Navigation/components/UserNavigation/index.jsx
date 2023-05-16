import { NavLink, useNavigate } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import Notifications from "../Notifications";
import AvatarDropdown from '../AvatarDropdown';
import APIContext from "../../../../contexts/APIContext";
import { useContext } from "react";
import { logout } from "../../../../NetworkUtils";

function UserNavigation(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const navigate = useNavigate();

  async function logoutHandler() {
    await logout();
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    navigate("/login");
  }

  return <>
    <Nav className="me-auto">
      <Nav.Item><NavLink className="nav-link" to={"/search"}>Home</NavLink></Nav.Item>
      <Nav.Item><NavLink className="nav-link" to={"/my-listings"}>My Listings</NavLink></Nav.Item>
      <Nav.Item><NavLink className="nav-link" to={"/my-reservations"}>My Reservations</NavLink></Nav.Item>
    </Nav>
    <Nav>
      <Notifications />
      <Dropdown>
        <AvatarDropdown />
        <Dropdown.Menu align="end">
          <LinkContainer to="/my-profile">
            <Dropdown.Item active={props.url === '/my-profile'}>My Profile</Dropdown.Item>
          </LinkContainer>
          <Dropdown.Item onClick={logoutHandler} active={false}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Nav>
  </>
}

export default UserNavigation;