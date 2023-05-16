import { useEffect, useState } from "react";
import { sendRequestWithoutAuth } from "../../../../NetworkUtils";
import Dropdown from 'react-bootstrap/Dropdown';

function SearchFilter(props) {
  const [searchErrorMsg, setSearchErrorMsg] = useState("");
  const [sort, setSort] = useState("price");
  const [order, setOrder] = useState("ascending");

  let curr = new Date();
  curr.setDate(curr.getDate());
  let date = curr.toISOString().substring(0, 10);

  const [formState, setFormState] = useState({
    date_start: date,
    date_end: date,
  });

  async function searchHandler(event) {
    event.preventDefault();

    let amenities = event.target.amenities.value.split(",");
    amenities.forEach((amenity, index, amenities) => {
      amenities[index] = amenity.trim();
    });

    let params = {
      date_start: event.target.date_start.value,
      date_end: event.target.date_end.value,
      guests: event.target.numGuests.value,
      location: event.target.location.value,
      amenities: amenities,
    };

    setFormState(params);
  }

  useEffect(() => {
    const search = async () => {
      let params = formState;
      params = {...params, sort: sort, order: order, page: props.page};
      let url = "http://localhost:8000/properties/search/?" + new URLSearchParams(params);

      try {
        let responseJson = await sendRequestWithoutAuth(url);
        props.setSearchResults(responseJson.results);
        if (responseJson.next !== null) {
          props.setIsNext(true);
        } else {
          props.setIsNext(false);
        }
        setSearchErrorMsg("")
      } catch (error) {
        let errorJson = JSON.parse(error.message);
        setSearchErrorMsg(errorJson.response)
        return
      }
    };

    search().catch(error => console.log(error));
  }, [sort, order, formState, props.page]);


  return <div className="d-flex flex-column justify-content-between">
    <form role="search" onSubmit={(e) => searchHandler(e)} id="searchForm">
      {searchErrorMsg ? <p className="text-danger">{searchErrorMsg}</p> : <div></div>}
      <div className="d-flex">
        <input className="form-control me-1" type="search" name="location" placeholder="Location"
          aria-label="Location" />
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
      <div className="d-flex mt-2 w-100">
        <div className="w-50 me-1">
          <small className="form-label" htmlFor="start">Start Date</small>
          <input className="form-control me-1" type="date" id="start" name="date_start" defaultValue={date} />
        </div>
        <div className="w-50 ms-1">
          <small className="form-label" htmlFor="end">End Date</small>
          <input className="form-control" type="date" id="end" name="date_end" defaultValue={date} />
        </div>
      </div>
      <div className="d-flex mt-2">
        <input className="form-control me-1" type="number" id="numGuests" name="numGuests" min="1"
          placeholder="# Guests" />
      </div>
      <input className="mt-2 form-control w-100" type="text" id="amenities" name="amenities"
        placeholder="List of amenities" />
      <div className="d-flex flex-row justify-content-between">
        <label className="form-label w-100" htmlFor="amenities">Search by amenities (e.g.
          "balcony, bbq")</label>
        <Dropdown>
          <Dropdown.Toggle variant="none">Order</Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item onClick={(e) => setOrder("ascending")} active={order === "ascending"}>Ascending</Dropdown.Item>
            <Dropdown.Item onClick={(e) => setOrder("descending")} active={order === "descending"}>Descending</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="none">Sort</Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item onClick={(e) => setSort("rating")} active={sort === "rating"}>Rating</Dropdown.Item>
            <Dropdown.Item onClick={(e) => setSort("price")} active={sort === "price"}>Price</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </form>
  </div>
}

export default SearchFilter;