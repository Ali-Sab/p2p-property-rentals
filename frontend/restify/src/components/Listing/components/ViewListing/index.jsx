import Card from "react-bootstrap/Card"
import Carousel from 'react-bootstrap/Carousel'
import './style.css'
import Rating from "../../../shared/Rating";
import Reviews from "../../../Profile/components/Reviews";

function ViewListing(props) {
  const { owned, property, images, editListing, reserveBooking, price, userInfo } = props;
  return <Card>
    <div className="rounded-top text-white d-flex flex-row justify-content-center" style={{ backgroundColor: "#000" }}>
      {
        images.length > 0
          ? <Carousel>
            {
              images.map((image, index) => {
                return <Carousel.Item key={image.id}>
                  <img src={image.image} className="listing-image"
                    alt="Listing" />
                </Carousel.Item>
              })
            }
          </Carousel>
          : <img src="https://static.vecteezy.com/system/resources/previews/000/355/795/original/house-vector-icon.jpg"
            className="listing-image" alt="Listing" />
      }
    </div>
    <div className="p-3 text-black" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container justify-content-between text-center py-1">
        <div className="row row-cols-2">
          <div id="property-info" className="col">
            <h5>{property.name}</h5>
            <p>{property.guests} guests &#x2022; {property.beds} beds &#x2022; {property.bathrooms} bathrooms</p>
            {
              price !== undefined
                ? <p><span className="bolded">{price}</span> a night</p>
                : <div></div>
            }
          </div>
          <div className="col">
            {
              property.num_ratings > 0
                ? <div>
                  <Rating rating={property.rating} numberRating={true}>
                    <span title="Number of Reviews">({property.num_ratings})</span>
                  </Rating>
                  <p className="small text-muted mb-0">User Rating</p>
                </div>
                : <h6 className="mb-3">No Ratings</h6>
            }
            {
              props.owned
                ? <button className="btn btn-outline-dark mt-1" data-mdb-ripple-color="dark"
                  style={{ zIndex: "1" }} onClick={props.editListing}>
                  Edit property
                </button>
                : <button className="btn btn-primary mt-1" data-mdb-ripple-color="dark"
                  style={{ zIndex: "1" }} onClick={props.reserveBooking}>
                  Reserve Booking
                </button>
            }
          </div>
        </div>
      </div>
    </div>
    <div className="container p-3 text-black">
      <div className="mb-5">
        <p className="lead fw-normal mb-1">General Information</p>
        <div className="p-3" style={{ backgroundColor: "#f8f9fa" }}>
          {
            (property.amenities && property.amenities.length) > 0
              ? <div>
                <p>Amenities:</p>
                <ul>
                  {property.amenities.map((item, index) => {
                    return <li key={index}>{item}</li>
                  })}
                </ul>
              </div>
              : <div></div>
          }
          <p>{property.description}</p>
        </div>
        <div className="p-1" style={{ backgroundColor: "#ffffff" }}></div>
        <div className="p-3" style={{ backgroundColor: "#f8f9fa" }}>
          <h5>Host:</h5>
          <img className="d-inline-block align-middle avatar-image" style={{ width: "3rem", height: "3rem" }}
            src={userInfo.avatar} alt="A portrait of me" />
          <p><b href="profile.html">{userInfo.first_name + " " + userInfo.last_name}</b></p>
          <p>Email: {userInfo.email}</p>
          <p>Phone Number: {userInfo.phone_number}</p>
        </div>
      </div>
      <Reviews property={property} forProfile={false} />
    </div>
  </Card>
}

export default ViewListing;