import { useContext, useRef, useState } from "react";
import ViewListing from "./components/ViewListing";
import EditListing from "./components/EditListing";
import ReserveListing from "./components/ReserveListing";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style.css"
import APIContext from "../../contexts/APIContext";
import { sendRequest, sendRequestWithoutAuth } from "../../NetworkUtils";

function Listing(props) {
  const { user, setIsLoggedIn } = useContext(APIContext);
  const { listingId } = useParams();
  const navigate = useNavigate();
  const waitingForResponse = useRef(0);
  const [listingState, setListingState] = useState(0);  // 0 = view, 1 = editing, 2 = reserving
  const [owned, setOwned] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState({});
  const [propertyImages, setPropertyImages] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (isNaN(Number(listingId))) {
      navigate('/')
      return;
    }

    const getListing = async () => {
      waitingForResponse.current = 1;
      let url = "http://localhost:8000/properties/" + listingId + "/view/";
      let owner = user;

      try {
        let responseJson = await sendRequestWithoutAuth(url);
        if (responseJson.owner === user) {
          setOwned(true);
        } else {
          setOwned(false);
          owner = responseJson.owner;
        }
        setPropertyInfo(responseJson);
      } catch (error) {
        navigate('/404');
        return;
      }

      url = "http://localhost:8000/properties/" + listingId + "/list/images/";

      try {
        let responseJson = await sendRequestWithoutAuth(url);
        setPropertyImages(responseJson);
      } catch (error) {
        return;
      }

      url = "http://localhost:8000/users/view/?" + new URLSearchParams({
        user: owner
      });

      try {
        let responseJson = await sendRequestWithoutAuth(url, "GET");
        setUserInfo(responseJson);
      } catch (error) {
        let errorJson = JSON.parse(error.message);
        if (errorJson.status === 404) {
          navigate('/')
        } else {
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", false);
          navigate('/login');
        }
      }
    };

    if (waitingForResponse.current === 0)
      getListing().catch(error => console.log(error)).finally(() => waitingForResponse.current = 0);
  }, [listingId, setOwned, setPropertyInfo, setPropertyImages, setUserInfo, setIsLoggedIn, user, navigate]);

  async function refetchPropertyData() {
    let url = "http://localhost:8000/properties/" + listingId + "/view/";

    try {
      let responseJson = await sendRequestWithoutAuth(url);
      if (responseJson.owner === user) {
        setOwned(true);
      } else {
        setOwned(false);
      }
      setPropertyInfo(responseJson);
    } catch (error) {
      navigate('/404');
      return;
    }

    url = "http://localhost:8000/properties/" + listingId + "/list/images/";

    try {
      let responseJson = await sendRequestWithoutAuth(url);
      setPropertyImages(responseJson);
    } catch (error) {
      return;
    }
  }

  function reserveBookingHandler() {
    setListingState(2);
  }

  function reserveBookingCancel() {
    setListingState(0);
  }

  function editListingHandler() {
    setListingState(1);
  }

  function editListingCancel() {
    setListingState(0);
  }

  function editListingSuccess() {
    setListingState(0);
    refetchPropertyData();
  }

  switch (listingState) {
    case 1:
      return <EditListing property={propertyInfo} images={propertyImages} viewListing={editListingCancel} changedListing={editListingSuccess} />
    case 2:
      return <ReserveListing property={propertyInfo} viewListing={reserveBookingCancel} />
    default:
      return <ViewListing owned={owned} property={propertyInfo} images={propertyImages} userInfo={userInfo} editListing={editListingHandler} reserveBooking={reserveBookingHandler} />
  }
}

export default Listing;