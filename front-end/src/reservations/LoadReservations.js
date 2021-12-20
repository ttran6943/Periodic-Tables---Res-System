import React, { useState } from "react";
import { useHistory } from "react-router";
import { updateReservationStatus } from "../utils/api";
import { Link } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function LoadReservations({ reservation }) {
  const history = useHistory();

  const [error, setError] = useState(null);

  const handleCancel = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      updateReservationStatus(
        reservation.reservation_id,
        "cancelled",
        abortController.signal
      )
        .then(() => history.go(0))
        .catch(setError);
    }
  };

  const handleFinishButton = async () => {
    const abortController = new AbortController();
    updateReservationStatus(
      reservation.reservation_id,
      "finished",
      abortController.signal
    )
      .then(() => history.go(0))
      .catch(setError);
  };

  return (
    <div className="card my-2 mx-3 col-lg-6 col-sm-11 justify-content-around">
      <div className="card-body">
        <h5 className="card-title">{`Reservation Name: ${reservation.first_name} ${reservation.last_name}`}</h5>
        <p className="card-text">
          {`Reservation ID: ${reservation.reservation_id}`}
        </p>
        <p>{`Reservation Time: ${reservation.reservation_time}`}</p>
        <p>{`Mobile Number: ${reservation.mobile_number}`}</p>
        <p>{`Party Size: ${reservation.people}`}</p>
        {reservation.status === "booked" ? (
          <>
            <p data-reservation-id-status={reservation.reservation_id}>
              Status: Booked
            </p>
            <Link to={`/reservations/${reservation.reservation_id}/seat`}>
              <button
                type="submit"
                href={`/reservations/${reservation.reservation_id}/seat`}
                className="btn btn-info float"
              >
                Seat
              </button>
            </Link>

            <Link
              href={`/reservations/${reservation.reservation_id}/edit`}
              to={`/reservations/${reservation.reservation_id}/edit`}
            >
              <button
                href={`/reservations/${reservation.reservation_id}/edit`}
                className="btn btn-secondary float-right mr-2"
              >
                Edit
              </button>
            </Link>
          </>
        ) : reservation.status === "seated" ? (
          <>
            <p data-reservation-id-status={reservation.reservation_id}>
              Status: Seated
            </p>
            <button className="btn btn-info float" onClick={handleFinishButton}>
              Finish
            </button>
          </>
        ) : reservation.status === "cancelled" ? (
          <p>Status: Cancelled</p>
        ) : reservation.status === "finished" ? (
          <p data-reservation-id-status={reservation.reservation_id}>
            Status: Finished
          </p>
        ) : null}
        {reservation.status === "cancelled" ||
        reservation.status === "finished" ? null : (
          <button
            className="btn btn-danger float-right mr-2"
            data-reservation-id-cancel={reservation.reservation_id}
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        <ErrorAlert error={error} />
      </div>
    </div>
  );
}

export default LoadReservations;
