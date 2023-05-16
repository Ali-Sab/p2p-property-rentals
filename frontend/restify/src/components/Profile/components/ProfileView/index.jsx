import Card from 'react-bootstrap/Card';
import ProfileHead from '../ProfileHead';
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import APIContext from '../../../../contexts/APIContext';
import { sendRequest } from '../../../../NetworkUtils';
import Rating from '../../../shared/Rating';
import Reviews from '../Reviews';

function ProfileView(props) {
  const { setIsLoggedIn, user, setUser, setFirstName, setAvatar } = useContext(APIContext);
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  let waitingForResponse = useRef(0);

  useEffect(() => {
    const getProfile = async () => {
      waitingForResponse.current = 1;
      let url = "";

      if (userId === undefined) {
        url = "http://localhost:8000/users/view/self/";
      } else if (isNaN(Number(userId))) {
        navigate('/')
        return;
      } else {
        url = "http://localhost:8000/users/view/?" + new URLSearchParams({
          user: userId
        });
      }

      try {
        let responseJson = await sendRequest(url, "GET");
        if (userId === undefined) {
          setUser(responseJson.id);
          setFirstName(responseJson.first_name);
          setAvatar(responseJson.avatar);
          localStorage.setItem("user", responseJson.id);
          localStorage.setItem("firstName", responseJson.first_name);
          localStorage.setItem("avatar", responseJson.avatar);
        }
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
    }

    if (waitingForResponse.current === 0)
      getProfile().catch(error => console.log(error)).finally(() => waitingForResponse.current = 0);
  }, [userId, setUser, navigate, setIsLoggedIn, setUserInfo, setAvatar, setFirstName]);

  return <Card>
    <ProfileHead userInfo={userInfo}>
      {
        (userId === undefined || user === Number(userId))
          ? <button className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: 1 }} onClick={props.editProfile}>
            Edit profile
          </button>
          : <div></div>
      }
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
    {
      userInfo.id
        ? <Reviews userId={userInfo.id} forProfile={true} />
        : <div></div>
    }
  </Card>
}

export default ProfileView;