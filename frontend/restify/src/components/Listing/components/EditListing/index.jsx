import EditListingDetails from "../EditListingDetails";
import ListingImages from "../ListingImages";
import EditListingImages from "../EditListingImages";
import EditListingDescription from "../EditListingDescription";
import EditAvailability from "../EditAvailability";

function EditListing(props) {
  const { viewListing, changedListing, images, property } = props;
  return <>
    <h2 className="mt-2 mb-3">Edit Property</h2>
    <EditListingDetails success={changedListing} canceled={viewListing} property={property}/>
    <hr className="solid" />
    <ListingImages success={changedListing} images={images} propertyId={property.id}/>
    <EditListingImages success={changedListing} canceled={viewListing} property={property}/>
    <hr className="solid" />
    <EditListingDescription success={changedListing} canceled={viewListing} property={property}/>
    <hr className="solid" />
    <EditAvailability success={changedListing} canceled={viewListing} propertyId={property.id}/>
  </>
}

export default EditListing;