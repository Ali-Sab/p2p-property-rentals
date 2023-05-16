import Card from "react-bootstrap/Card"
import Rating from "../../../shared/Rating";
import ProfileHead from "../../../Profile/components/ProfileHead"
import ListingCard from "../ListingCard";
import { useContext, useEffect, useRef, useState } from "react";
import APIContext from "../../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../../NetworkUtils";

function ViewListings(props) {
  const { setIsLoggedIn, setUser, setFirstName, setAvatar } = useContext(APIContext);
  const [listings, setListings] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  let waitingForResponse = useRef(0);
  const [page, setPage] = useState(1);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    const getProfileAndListings = async () => {
      waitingForResponse.current = 1;

      const urlProfile = "http://localhost:8000/users/view/self/";
      const urlListings = "http://localhost:8000/properties/list/?" + new URLSearchParams({
        page: page
      });

      try {
        let responseJson = await sendRequest(urlProfile, "GET");
        setUser(responseJson.id);
        setFirstName(responseJson.first_name);
        setAvatar(responseJson.avatar);
        localStorage.setItem("user", responseJson.id);
        localStorage.setItem("firstName", responseJson.first_name);
        localStorage.setItem("avatar", responseJson.avatar);
        setUserInfo(responseJson);
      } catch (error) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate("/login");
        return;
      }

      try {
        let responseJson = await sendRequest(urlListings, "GET");
        setListings(responseJson.results);
        if (responseJson.next !== null) {
          setIsNext(true);
        } else {
          setIsNext(false);
        }
      } catch (error) {
        let errorJson = JSON.parse(error.message);
        if (errorJson.status === 404) {
          navigate('/404');
        } else {
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", "false");
          navigate('/login');
        }
      }
    }


    if (waitingForResponse.current === 0) {
      getProfileAndListings().catch(error => console.log(error)).finally(() => waitingForResponse.current = 0);
    }
  }, [navigate, setIsLoggedIn, setListings, setAvatar, setFirstName, setUser, setUserInfo, page, setIsNext]);

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

  return <Card>
    <ProfileHead userInfo={userInfo}>
      <button className="btn btn-primary" data-mdb-ripple-color="dark" style={{ zIndex: 1 }} onClick={props.addListing}>
        Add Listing
      </button>
    </ProfileHead>
    <div className="p-3 text-black" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="d-flex justify-content-end text-center py-1">
        {
          userInfo.num_ratings > 0
            ? <div>
              <Rating rating={userInfo.rating} numberRating={true}>
                <span title="Number of Reviews">({userInfo.num_ratings})</span>
              </Rating>
              <p className="small text-muted mb-0">User Rating</p>
            </div>
            : <h6 className="mb-3">No Ratings</h6>
        }
      </div>
    </div>
    <div className="container p-3 text-black">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2">
        {
          listings.length > 0
            ? listings.map((item, index) => {
              return <ListingCard key={index} listing={item} />
            })
            : <div></div>
        }
      </div>
    </div>
    <nav className="mt-2" aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        {
          page > 1
            ? <li className="page-item"><button className="page-link" onClick={prevPage}>Previous</button></li>
            : <div></div>
        }
        {
          isNext
            ? <li className="page-item"><button className="page-link" onClick={nextPage}>Next</button></li>
            : <div></div>
        }
      </ul>
    </nav>
  </Card>
}

export default ViewListings;