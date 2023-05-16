import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from "react-router-bootstrap"
import { BellFill, Trash } from "react-bootstrap-icons"
import { useContext, useEffect, useState } from 'react';
import APIContext from '../../../../contexts/APIContext';
import { sendRequest } from '../../../../NetworkUtils';
import { useNavigate } from 'react-router-dom';
import './style.css';
import moment from 'moment';


function Notifications(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [isNext, setIsNext] = useState(false);
  const navigate = useNavigate();

  function nextPage() {
    if (isNext) {
      setPage(page + 1);
    }
  }

  function prevPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  useEffect(() => {
    const getNotifications = async () => {
      await new Promise(r => setTimeout(r, 33));
      const url = "http://localhost:8000/users/notifications/?" + new URLSearchParams({
        page: page
      })

      try {
        let responseJson = await sendRequest(url, "GET");
        setNotifications(responseJson.results);
        if (responseJson.next !== null) {
          setIsNext(true);
        } else {
          setIsNext(false);
        }
      } catch (error) {
        let errorJson = JSON.parse(error);
        if (errorJson.status === 401) {
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", "false");
          navigate("/login");
        }
      }
    };

    getNotifications().catch(error => console.log(error));
  }, [page]);

  async function deleteNotification(id, index) {
    const url = "http://localhost:8000/users/notifications/" + id + "/delete/"

    try {
      let responseJson = await sendRequest(url, "DELETE");
      let tempNotifications = notifications.slice();
      tempNotifications.splice(index, 1);
      setNotifications(tempNotifications)
    } catch (error) {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      navigate("/login");
    }
  }

  return <Dropdown>
    <Dropdown.Toggle variant='none'>
      <BellFill />
    </Dropdown.Toggle>
    <Dropdown.Menu align="end">
      {
        notifications.length > 0
          ? notifications.map((item, index) => {
            return <Dropdown.Item key={index} className="delete-notification" >
              <div className="d-flex flex-row justify-content-between align-items-start">
                <div className="d-flex flex-column align-items-start justify-content-start">
                  <p style={{ fontSize: ".9rem"}}>{item.notification_msg}</p>
                  <small>{moment(item.date_created).format("yy-MM-D")}</small>
                </div>
                <Trash style={{transform: "scale(1.5)"}} onClick={(e) => deleteNotification(item.id, index)} className="trash delete-notification mt-1 ms-2" />
              </div>
            </Dropdown.Item>
          })
          : <label className="ms-2">No Notifications</label>
      }
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          {
            page > 1
              ? <li className="page-item mt-2"><button className="page-link" onClick={prevPage}>Previous</button></li>
              : <div></div>
          }
          {
            isNext
              ? <li className="page-item mt-2"><button className="page-link" onClick={nextPage}>Next</button></li>
              : <div></div>
          }
        </ul>
      </nav>
    </Dropdown.Menu>
  </Dropdown>
}

export default Notifications