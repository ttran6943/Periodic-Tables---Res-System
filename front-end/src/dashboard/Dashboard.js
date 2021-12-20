import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { next, previous, today } from "../utils/date-time";
import { useHistory } from "react-router";
import Tables from "../tables/Tables";
import LoadReservations from "../reservations/LoadReservations";
import { deleteTable } from "../utils/api";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [displayDate, setDisplayDate] = useState(date);
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const history = useHistory();

  const handlePrevButton = () => {
    setDisplayDate(previous(displayDate));
    history.replace(`/dashboard?date=${previous(displayDate)}`);
  };

  const handleTodayButton = () => {
    setDisplayDate(today(displayDate));
    history.replace(`/dashboard?date=${today(displayDate)}`);
  };

  const handleNextButton = () => {
    setDisplayDate(next(displayDate));
    history.replace(`/dashboard?date=${next(displayDate)}`);
  };

  const loadNavButtons = () => {
    return (
      <>
        <div className="btn-group mb-2" role="group" aria-label="Basic example">
          <button className="btn btn-secondary" onClick={handlePrevButton}>
            Previous
          </button>
          <button className="btn btn-secondary" onClick={handleTodayButton}>
            Today
          </button>
          <button className="btn btn-secondary " onClick={handleNextButton}>
            Next
          </button>
        </div>
      </>
    );
  };

  const loadResForDay = () => {
    return (
      <>
        {reservations.map((reservation) => {
          if (reservation.reservation_date === displayDate) {
            return (
              <LoadReservations
                key={reservation.reservation_id}
                reservation={reservation}
              />
            );
          }
          return null;
        })}
      </>
    );
  };

  const displayHeader = () => {
    return (
      <>
        <h1>Dashboard</h1>
        <div className="d-md-flex mb-3">
          <h4 className="mb-0">{`Reservations for date: ${displayDate}`}</h4>
        </div>
      </>
    );
  };

  const displayTablesHeader = () => {
    return <h4 className="my-2">Tables</h4>;
  };

  const finishHandler = async (tableId) => {
    const abortController = new AbortController();

    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      deleteTable(tableId, abortController.signal)
        .then(() => (refresh === false ? setRefresh(true) : setRefresh(false)))
        .catch(setTablesError);
    }
  };

  useEffect(() => {
    const compare = (a, b) => {
      return (
        new Date(a.reservation_date + " " + a.reservation_time) -
        new Date(b.reservation_date + " " + b.reservation_time)
      );
    };

    async function loadDashboard() {
      const abortController = new AbortController();
      setReservationsError(null);
      listReservations({ date }, abortController.signal)
        .then((res) => res.sort(compare))
        .then(setReservations)
        .catch(setReservationsError);
      return () => abortController.abort();
    }
    loadDashboard();
  }, [date, refresh]);

  // async function loadDashboard() {
  //   const compare = (a, b) => {
  //     return (
  //       new Date(a.reservation_date + " " + a.reservation_time) -
  //       new Date(b.reservation_date + " " + b.reservation_time)
  //     );
  //   };

  //   const abortController = new AbortController();
  //   setReservationsError(null);
  //   listReservations({ date }, abortController.signal)
  //     .then((res) => res.sort(compare))
  //     .then(setReservations)
  //     .catch(setReservationsError);
  //   return () => abortController.abort();
  // }

  return (
    <main className="mt-2">
      <div className="col-12">{displayHeader()}</div>
      <div className="col-12">
        <ErrorAlert error={reservationsError} />
        {loadNavButtons()}
      </div>
      <div className="col-12">
        <div className="row">{loadResForDay()}</div>
      </div>
      <div className="col-12">{displayTablesHeader()}</div>
      <div className="row">
        <div className="col-12">
          <ErrorAlert error={tablesError} />
          <Tables finishHandler={finishHandler} refresh={refresh} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
