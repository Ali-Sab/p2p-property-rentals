import { LinkContainer } from "react-router-bootstrap"
import Carousel from 'react-bootstrap/Carousel'
import Rating from "../../../shared/Rating";

function ListingCard(props) {
  const { id, images, name, description, price, rating, num_ratings } = props.listing;

  return <div className="col">
    <div className="card p-0 m-1">
      <div className="card-top">
        {
          images.length > 0
            ? <Carousel>
              {
                images.map((image, index) => {
                  return <Carousel.Item key={image.id}>
                    <img src={image.image}
                      className="card-img-top" alt="Listing" />
                  </Carousel.Item>
                })
              }
            </Carousel>
            : <img src="https://static.vecteezy.com/system/resources/previews/000/355/795/original/house-vector-icon.jpg"
              className="card-img-top" alt="Listing" />
        }
      </div>
      <LinkContainer to={"/property/" + id}>
        <div className="card-body p-2">
          <h5 className="card-title">{name}</h5>
          <p className="card-text">{description}</p>
          {
            price !== undefined
              ? <p className="card-text text-body-primary"><span className="bolded">${price}</span> a night
              </p>
              : <div></div>
          }
          {/* {
            rating !== undefined
              ? <Rating rating={rating} />
              : <div></div>
          } */}
        </div>
      </LinkContainer>
    </div>
  </div>
}

export default ListingCard;