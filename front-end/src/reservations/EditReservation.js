import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import ReservationForm from "../components/ReservationForm";
import { findReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function EditReservation() {
  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(initialForm);
  // const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReservation() {
      const abortController = new AbortController();
      setError(null);
      findReservation(reservationId, abortController.signal)
        .then(setReservation)
        .catch(setError);
      return () => abortController.abort();
    }
    loadReservation();
  }, [reservationId]);


  return (
    <div className="col-12 mt-2">
      <h1>{`Edit Reservation ID: ${reservationId}`}</h1>
      <div className="col-12">
        <ErrorAlert error={error} />
      </div>
      <ReservationForm method={"edit"} initialForm={reservation} />
    </div>
  );
}

export default EditReservation;
