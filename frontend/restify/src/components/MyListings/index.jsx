import ViewListings from "./components/ViewListings";
import AddListing from "./components/AddListing";
import { useState } from "react";

function MyListings(props) {
  const [addingListing, setAddingListing] = useState(false);

  function addListingHandler() {
    setAddingListing(true);
  }

  function addListingCancel() {
    setAddingListing(false);
  }

  return <>
    {
      addingListing
        ? <AddListing viewListings={addListingCancel} />
        : <ViewListings addListing={addListingHandler} />
    }
  </>


}

export default MyListings;