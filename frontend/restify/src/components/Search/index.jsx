import { useEffect, useRef, useState } from "react";
import SearchFilter from "./components/SearchFilter";
import SearchResults from "./components/SearchResults";
import Card from "react-bootstrap/Card"

function Search(props) {
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isNext, setIsNext] = useState(false);

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

  return <div className="card p-3 text-black">
    <div className="d-flex m-1">
      <p className="lead fw-normal mb-0">Listings</p>
    </div>
    <SearchFilter setSearchResults={setSearchResults} page={page} setIsNext={setIsNext}/>
    <SearchResults searchResults={searchResults} />
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
  </div>

}

export default Search;