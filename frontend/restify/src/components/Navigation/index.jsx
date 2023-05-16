import { useState, useEffect, useContext } from 'react';
import { useLocation } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap"
import Container from "react-bootstrap/Container"
import Navbar from 'react-bootstrap/Navbar';
import NavbarBrand from "react-bootstrap/NavbarBrand";
import UserNavigation from './components/UserNavigation';
import GuestNavigation from './components/GuestNavigation';
import APIContext from '../../contexts/APIContext';

function Navigation(props) {
  const location = useLocation();
  const [url, setUrl] = useState(null);
  useEffect(() => {
    setUrl(location.pathname);
  }, [location]);

  const { isLoggedIn } = useContext(APIContext);

  return <div>
    <Navbar bg="light" expand="md">
      <Container fluid>
        <LinkContainer to={isLoggedIn ? "/" : "/login"}>
          <NavbarBrand>Restify</NavbarBrand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          {isLoggedIn
            ? <UserNavigation url={url}/>
            : <GuestNavigation url={url}/>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  </div>
}

export default Navigation

