import ListingCard from "../../../MyListings/components/ListingCard";

function SearchResults(props) {
  const { searchResults } = props;
  return <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2">
    {
      searchResults.length > 0
        ? searchResults.map((item, index) => {
          console.log(item)
          return <ListingCard key={index} listing={item} />
        })
        : <div></div>
    }
  </div>
}

export default SearchResults;