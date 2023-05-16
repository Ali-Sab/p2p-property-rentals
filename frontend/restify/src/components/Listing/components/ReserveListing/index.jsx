import { useContext, useEffect, useState } from "react";
import APIContext from "../../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../../NetworkUtils";

function ReserveListing(props) {
  const { authToken, setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState({});
  const [checkErrorMsg, setCheckErrorMsg] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const { property, viewListing } = props;

  async function reserveHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("date_start", event.target.date_start.value);
    formdata.append("date_end", event.target.date_end.value);
    formdata.append("reply_by", event.target.reply_by.value);

    const url = "http://localhost:8000/properties/" + property.id + "/reservation/create/";

    try {
      setCheckErrorMsg("");
      let responseJson = await sendRequest(url, "POST", formdata);
      props.viewListing();
      setErrorMsgs([]);
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 400) {
        setErrorMsgs(errorJson.response);
      } else if (errorJson.status === 404) {
        alert("Failed to book. Please try again later or contact support.");
        props.viewListings();
      } else {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login');
      }
    }
  }

  useEffect(() => {
    const checkPrice = async () => {
      if (startDate === "" || endDate === "")
        return;
      {
        let start = new Date(startDate);
        let end = new Date(endDate);
        let days = ((end - start) / (60 * 60 * 24 * 1000)) + 1;
        setDays(days);
        if (days < 1) {
          setCheckErrorMsg("End Date must be on the same day or after Start Date");
          return;
        }
      }
      const url = "http://localhost:8000/properties/reservation/check/?" + new URLSearchParams({
        date_start: startDate,
        date_end: endDate,
        property: property.id
      });

      try {
        setErrorMsgs([]);
        let responseJson = await sendRequest(url, "GET");
        setAvgPrice(responseJson.avg_price);
        setTotalPrice(responseJson.total_price);
        setCheckErrorMsg("");
      } catch (error) {
        let errorJson = JSON.parse(error.message);
        if (errorJson.status === 400) {
          setCheckErrorMsg(errorJson.response);
        } else if (errorJson.status === 404) {
          alert("Failed to book. Please try again later or contact support.");
          props.viewListing();
        } else {
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", "false");
          navigate('/login');
        }
      }
    };

    checkPrice().catch(error => console.log(error));
  }, [startDate, endDate, setCheckErrorMsg]);

  return <main>
    <div className="login-form d-flex flex-column">
      <h2 className="text-center pb-2">Making reservation for: {property.name}</h2>
      <img className="rounded-circle user-image" src="https://www.boirongroup.ca/img/GenericHouse002.jpg"
        alt="Property Image" />
      <form onSubmit={(e) => reserveHandler(e)}>
        <div className="mb-3">
          <label htmlFor="inputStartDate1" className="form-label">Start Date</label>
          <input type="date" className="form-control" id="inputStartDate1" name="date_start" onChange={(e) => setStartDate(e.target.value)} aria-describedby="startDateHelp" style={{ backgroundColor: (errorMsgs['date_start'] ? "red" : "white") }}/>
          {errorMsgs['date_start'] ? <p className="text-danger">{errorMsgs['date_start']}</p> : <div></div>}
        </div>
        <div className="mb-3">
          <label htmlFor="inputEndDate1" className="form-label">End Date</label>
          <input type="date" className="form-control" id="inputEndDate1" name="date_end" onChange={(e) => setEndDate(e.target.value)} aria-describedby="endDateHelp" style={{ backgroundColor: (errorMsgs['date_end'] ? "red" : "white") }} />
          {errorMsgs['date_end'] ? <p className="text-danger">{errorMsgs['date_end']}</p> : <div></div>}
        </div>
        <div className="mb-3">
          <label htmlFor="inputEndDate1" className="form-label">Reply By</label>
          <input type="date" className="form-control" id="inputEndDate1" name="reply_by" aria-describedby="endDateHelp" style={{ backgroundColor: (errorMsgs['reply_by'] ? "red" : "white") }} />
          {errorMsgs['reply_by'] ? <p className="text-danger">{errorMsgs['reply_by']}</p> : <div></div>}
        </div>
        {
          checkErrorMsg
            ? <p className="text-danger">{checkErrorMsg}</p>
            : <div>
              <p className="mb-2"><span className="bolded">${avgPrice}</span> a night</p>
              <p className="mb-2">You have selected {days} nights.</p>
              <p className="mb-2">Subtotal: <span className="bolded">${avgPrice}</span> &#215; <span className="bolded">{days}</span> &#61; <span className="bolded">${totalPrice}</span></p>
            </div>
        }
        <div className="d-flex flex-row justify-content-between align-items-center mb-5">
          {
            errorMsgs['property']
              ? <p className="text-danger">{errorMsgs['property']}</p>
              : <div></div>
          }
          <div className=" d-flex justify-content-end">
            <button onClick={viewListing} className="btn btn-danger me-2">Cancel</button>
            <button className="btn btn-primary">Book Reservation</button>
          </div>
        </div>
      </form>
    </div>
  </main>
}

export default ReserveListing;