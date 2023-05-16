import { useContext, useEffect, useRef, useState } from "react";
import APIContext from "../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../NetworkUtils";
import ReservationCard from "../ReservationCard";

function UserReservations(props) {

  const { setIsLoggedIn } = useContext(APIContext);
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();
  let waitingForResponse = useRef(0);
  const [page, setPage] = useState(1);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    const getReservations = async () => {
      waitingForResponse.current = 1;

      const url = "http://localhost:8000/properties/reservations/user/?" + new URLSearchParams({
        page: page
      });

      try {
        let responseJson = await sendRequest(url, "GET");
        setReservations(reservations.concat(responseJson.results));
        if (responseJson.next !== null) {
          setIsNext(true);
        } else {
          setIsNext(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate("/login");
        return;
      }
    }


    if (waitingForResponse.current === 0) {
      getReservations().catch(error => console.log(error)).finally(() => waitingForResponse.current = 0);
    }
  }, [page]);

  function nextPage() {
    if (isNext) {
      setPage(page + 1);
    }
  }

  function updateReservations(index, state) {
    let tempReservations = reservations;
    tempReservations[index].state = state;
    setReservations(reservations);
  }

  return <div className="d-flex flex-column align-content-center">
    {
      reservations.length > 0
        ? reservations.map((item, index) => {
          return <ReservationCard key={index} index={index} reservation={item} isHost={false} updateReservation={updateReservations}/>
        })
        : <div></div>
    }
    {
      isNext
        ? <button className="btn btn-primary" onClick={nextPage}>Load More</button>
        : <div></div>
    }
  </div>
}

export default UserReservations;