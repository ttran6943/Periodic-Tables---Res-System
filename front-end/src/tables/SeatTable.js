import React, { useState, useEffect } from "react";
import { updateTable, updateReservationStatus, listTables } from "../utils/api";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";

function SeatTable() {
  const { reservationId } = useParams();
  const history = useHistory();

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [tableId, setTableId] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    setTablesError(null);
    async function loadTables() {
      listTables(abortController.signal).then(setTables).catch(setTablesError);
      return () => abortController.abort();
    }
    loadTables();
  }, []);

  const handleSubmit = async (event) => {
    const abortController = new AbortController();
    event.preventDefault();
    updateTable(tableId, reservationId, abortController.signal)
      .then(() => updateTableWithRes())
      .catch(setTablesError);
  };

  const updateTableWithRes = async () => {
    const abortController = new AbortController();
    const status = "seated";
    updateReservationStatus(reservationId, status, abortController.signal)
      .then(() => history.replace(`/dashboard`))
      .catch(setTablesError);
  }

  const changeHandler = ({ target }) => {
    setTableId(Number(target.value));
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="col-12 mt-2">
      <div>
        <h1>{`Seat Reservation for Reservation ID: ${reservationId}`}</h1>
        <ErrorAlert error={tablesError} />
        <form onSubmit={handleSubmit}>
          <div>
            <label className="mr-2" htmlFor="table_name">
              Table Number
            </label>
            <select
              name="table_id"
              minLength="2"
              onChange={changeHandler}
              required
            >
              <option value="">Select a Table</option>
              {tables.map((table) => (
                <option
                  key={table.table_id}
                  value={table.table_id}
                >
                  {table.table_name} - {table.capacity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="btn btn-danger mr-2"
              onClick={goBack}
              type="button"
            >
              Cancel
            </button>
            <button className="btn btn-info" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SeatTable;
