import Dropdown from 'react-bootstrap/Dropdown';
import { useContext } from 'react';
import APIContext from '../../../../contexts/APIContext';
import "./style.css";

function AvatarDropdown(props) {
  const { isLoggedIn, firstName, avatar } = useContext(APIContext);

  return <div>
    {
      isLoggedIn
        ? <Dropdown.Toggle variant="none">
          <img className="d-inline-block align-text-top me-1 navbar-avatar" style={{ width: '1.3rem', height: '1.3rem' }}
            src={avatar} alt="A portrait of me" />
          {firstName}
        </Dropdown.Toggle>
        : <Dropdown.Toggle>Guest</Dropdown.Toggle>
    }
  </div>

}

export default AvatarDropdown;