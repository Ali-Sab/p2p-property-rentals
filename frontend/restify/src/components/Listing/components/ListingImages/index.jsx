import { useNavigate } from "react-router-dom";
import deleteImage from "../../../../assets/Delete-Button-PNG-Download-Image.png";
import './style.css'
import { useContext } from "react";
import APIContext from "../../../../contexts/APIContext";
import { sendRequest } from "../../../../NetworkUtils";

function ListingImages(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const navigate = useNavigate();
  
  async function deleteImageHandler(imageId) {
    let formdata = new FormData();
    formdata.append("property", props.propertyId);

    const url = "http://localhost:8000/properties/remove/images/" + imageId + "/";

    try {
      let responseJson = await sendRequest(url, "DELETE", formdata);
      props.success();
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login')
      } else if (errorJson.status === 403) {
        navigate('/');
      } else if (errorJson.status === 404) {
        navigate('/')
      }
    }
  }

  return <div className="d-flex flex-row justify-content-start property-image-scroll">
    {
      (props.images && props.images.length > 0)
        ? props.images.map((image, index) => {
          return <div key={image.id} className="d-flex flex-column justify-content-center p-1">
          <img className="img-fluid property-image" src={image.image} />
          <button onClick={(e) => deleteImageHandler(image.id)} className="btn btn-danger" title="Delete image">Delete Image</button>
          <img src={deleteImage} alt="Delete image" />
        </div>
        })
        : <b>You have no images.</b>
    }
  </div>
}

export default ListingImages;