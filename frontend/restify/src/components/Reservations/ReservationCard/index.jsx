import moment from "moment";
import { useEffect, useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { sendRequest } from "../../../NetworkUtils";

function ReservationCard(props) {
  const { index, setIsLoggedIn, reservation, isHost, updateReservation } = props;
  const [days, setDays] = useState(0);
  const [reservationState, setReservationState] = useState({});
  const navigate = useNavigate();

  function getReservationDisplay(state) {
    if (isHost) {
      switch (state) {
        case "pending":
          return ["Pending", "heavy", "Approve", "btn btn-primary", "Decline", "btn btn-danger btn-red"];
        case "denied":
          return ["Denied", "heavy", "", "", "", ""];
        case "approved":
          return ["Approved", "text-success-emphasis heavy", "Terminate", "btn btn-danger btn-red", "", ""];
        case "completed":
          if (reservation.can_review) {
            return ["Completed", "text-success-emphasis", "Leave a Review", "btn btn-success", "", ""];
          } else {
            return ["Completed", "text-success-emphasis", "", "", "", ""];
          }
        case "cancellation_request":
          return ["Cancellation Requested", "text-danger-emphasis heavy", "Approve", "btn btn-primary", "Decline", "btn btn-danger btn-red"];
        case "canceled":
          return ["Cancelled", "text-danger-emphasis", "", "", "", ""];
        case "terminated":
          return ["Terminated", "text-danger-emphasis heavy", "", "", "", ""];
        case "expired":
          return ["Expired", "text-danger-emphasis", "", "", "", ""];
        default:
          return ["", "", "", "", "", ""];
      }
    } else {
      switch (state) {
        case "pending":
          return ["Pending", "heavy", "Cancel", "btn btn-danger btn-red", "", ""];
        case "denied":
          return ["Denied", "heavy", "", "", "", ""];
        case "approved":
          return ["Approved", "text-success-emphasis heavy", "Request Cancellation", "btn btn-danger btn-red", "", ""];
        case "completed":
          if (reservation.can_review) {
            return ["Completed", "text-success-emphasis", "Leave a Review", "btn btn-success", "", ""];
          } else {
            return ["Completed", "text-success-emphasis", "", "", "", ""];
          }
        case "cancellation_request":
          return ["Cancellation Requested", "text-danger-emphasis heavy", "", "", "", ""];
        case "canceled":
          return ["Cancelled", "text-danger-emphasis", "", "", "", ""];
        case "terminated":
          return ["Terminated", "text-danger-emphasis heavy", "", "", "", ""];
        case "expired":
          return ["Expired", "text-danger-emphasis", "", "", "", ""];
        default:
          return ["", "", "", "", "", ""];
      }
    }
  }

  function getReservationRequest(action) {
    switch (action) {
      case "Approve":
        if (reservation.state === "pending") {
          return "approved";
        } else if (reservation.state === "cancellation_request") {
          return "canceled"
        } else {
          return "";
        }
      case "Decline":
        if (reservation.state === "pending") {
          return "denied";
        } else if (reservation.state === "cancellation_request") {
          return "approved"
        } else {
          return "";
        }
      case "Cancel":
        return "cancellation_request"
      case "Terminate":
        return "terminated";
      case "Leave a Review":
        return "review";
      case "Request Cancellation":
        return "cancellation_request";
      default:
        return "";
    }
  }

  useEffect(() => {
    let start = new Date(reservation.date_start);
    let end = new Date(reservation.date_end);
    let days = ((end - start) / (60 * 60 * 24 * 1000)) + 1;
    setDays(days);

    let reservationDisplay = getReservationDisplay(reservation.state);

    setReservationState({
      state: reservationDisplay[0],
      text_color: reservationDisplay[1],
      button: reservationDisplay[2],
      btn_color: reservationDisplay[3],
      button2: reservationDisplay[4],
      btn_color2: reservationDisplay[5]
    })
  }, [reservation, setDays, setReservationState]);

  async function updateReservationHandler(action) {
    const requestState = getReservationRequest(action);

    if (requestState === "") {
      return;
    }

    if (requestState === "review") {
      if (isHost) {
        navigate("/user/review", { state: {
          user_name: reservation.user_name,
          user_email: reservation.user_email
        }, replace: true})
      } else {
        navigate("/property/review", { state: {
          property_name: reservation.property_name,
          property_id: reservation.property_id,
          image: reservation.images.length > 0 ? reservation.images[0].image : "https://static.vecteezy.com/system/resources/previews/000/355/795/original/house-vector-icon.jpg"
        }, replace: true})
      }
      return;
    }

    const url = "http://localhost:8000/properties/reservation/" + reservation.id + "/update/";

    let formdata = new FormData();
    formdata.append("state", requestState);

    try {
      let responseJson = await sendRequest(url, "PUT", formdata);
      let reservationDisplay = getReservationDisplay(requestState);
      setReservationState({
        state: reservationDisplay[0],
        text_color: reservationDisplay[1],
        button: reservationDisplay[2],
        btn_color: reservationDisplay[3],
        button2: reservationDisplay[4],
        btn_color2: reservationDisplay[5]
      })
      updateReservation(index, requestState);
    } catch (error) {
      console.log(error)
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login');
      } else if (errorJson.status === 404) {
        window.location.reload(false);
      } else if (errorJson.status === 403) {
        window.location.reload(false);
        alert(errorJson.response)
      } else {
        window.location.reload(false);
        alert(errorJson.response)
      }
    }
  }

  return <div className="d-flex justify-content-between reservation-detail reservation-info">
    <div className="d-flex w-50 flex-column justify-content-evenly pe-2">
      <div className="d-flex flex-column justify-content-start align-items-center">
        <LinkContainer to={"/property/" + reservation.property_id}>
          <div className="position-relative text-center align-self-center subtle-link p-5">
            <h5>{reservation.property_name}</h5>
            <div className="text-black">
              <h6>{moment(reservation.date_start).format("MMMM D, YYYY")} - {moment(reservation.date_end).format("MMMM D, YYYY")}</h6>
              <p className="card-text text-body-primary"><span className="bolded">${reservation.avg_price} </span>
                for {days} nights</p>
            </div>
          </div>
        </LinkContainer>
      </div>
      <div className="hline"></div>
      <div className="d-flex flex-column justify-content-end align-items-center">
        <p>{!isHost ? "Host" : "User"}: <Link to={"/user/" + reservation.user_id} className="link-dark">{reservation.user_name}</Link></p>
        <p>Email: {reservation.user_email}</p>
        <p>Phone Number: {reservation.user_phone_number}</p>
      </div>
    </div>
    <div className="d-flex w-50 flex-column justify-content-between ps-2">
      <img className="w-100"
        src={reservation.images.length > 0 ? reservation.images[0].image : "https://static.vecteezy.com/system/resources/previews/000/355/795/original/house-vector-icon.jpg"}
        alt="Listing" />
      <div className="d-flex flex-row justify-content-between align-items-center mt-1">
        <p className={reservation.text_color}>{reservationState.state}</p>
        <div className="d-flex flex-row justify-content-end align-items-center">
          {
            reservationState.btn_color
              ? <button onClick={(e) => updateReservationHandler(reservationState.button)} className={reservationState.btn_color + " mt-1"}>{reservationState.button}</button>
              : <div></div>
          }
          {
            reservationState.btn_color2
              ? <button onClick={(e) => updateReservationHandler(reservationState.button2)} className={reservationState.btn_color2 + " ms-2 mt-1"}>{reservationState.button2}</button>
              : <div></div>
          }
        </div>
      </div>
    </div>
  </div>
}

export default ReservationCard;