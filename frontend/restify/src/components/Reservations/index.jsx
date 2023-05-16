import './style.css';
import HostReservations from './HostReservations';
import UserReservations from './UserReservations';
import { useState } from 'react';

function Reservations(props) {
  const [asHost, setAsHost] = useState(false);

  function seeAsHost() {
    setAsHost(true);
  }

  function seeAsUser() {
    setAsHost(false);
  }

  return <div className="container-fluid p-3 text-black">
    <h1>Reservations</h1>
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mb-2">
        <li className="page-item"><button className={"page-link " + (asHost ? "" : "active")} onClick={seeAsUser}>As a User</button>
        </li>
        <li className="page-item"><button className={"page-link " + (asHost ? "active" : "")} onClick={seeAsHost}>As a Host</button>
        </li>
      </ul>
    </nav>
    {
      asHost
        ? <HostReservations />
        : <UserReservations />
    }
  </div>
}

export default Reservations;