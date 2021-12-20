import React, { useState } from "react";
import { searchResByMobileNumber } from "../utils/api";
import LoadReservations from "../reservations/LoadReservations";
import ErrorAlert from "../layout/ErrorAlert";

function Search() {
  const initialForm = {
    mobile_number: "",
  };

  const [form, setForm] = useState(initialForm);
  const [reservations, setReservations] = useState([]);
  // const [toggleDisplay, setToggleDisplay] = useState(false);
  // const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [found, setFound] = useState(true);

  const handleChange = ({ target }) => {
    setForm({ [target.name]: target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    loadSearchResult();
  };

  const loadSearchResult = async () => {
    const abortController = new AbortController();
    searchResByMobileNumber(form.mobile_number, abortController.signal)
      .then(setReservations)
      .then(() => {
        if (reservations.length === 0) {
          setFound(false);
        }
      })
      // .then(() => setToggleDisplay(true))
      // .then(() => setRefresh(false))
      .catch(setError);
  };

  // useEffect(loadSearchResult, [toggleDisplay, refresh, form.mobile_number]);

  return (
    <div className="col-11 mt-2">
      <h1>Search</h1>
      <div className="col-12">
        <ErrorAlert error={error} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            onChange={handleChange}
            type="mobile_number"
            className="form-control"
            placeholder="Enter a customer's phone number"
            name="mobile_number"
            value={form.mobile_number}
          />
        </div>
        <button type="submit" className="my-2 btn btn-info">
          Find
        </button>
      </form>

      {reservations.length > 0 ? (
        reservations.map((reservation) => (
          <div key={reservation.reservation_id} className="row">
            <LoadReservations reservation={reservation} />
          </div>
        ))
      ) : found === true ? null : (
        <p>No reservations found.</p>
      )}
    </div>
  );
}

export default Search;
