import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { updateReservation, createReservation } from "../utils/api";
import { useParams } from "react-router";

function ReservationForm({ method, initialForm }) {
  const [form, setForm] = useState(initialForm);
  const [resError, setResError] = useState(null);

  const { reservationId } = useParams();

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const goToReservations = () => {
    history.replace(`/dashboard?date=${form.reservation_date}`);
  };

  const handleChange = async ({ target }) => {
    setForm({ ...form, [target.name]: target.value });
  };

  useEffect(() => {
    const abortController = new AbortController();
    async function setInitialForm() {
      setForm(initialForm);
    }
    setInitialForm();
    return () => abortController.abort();
  }, [initialForm])
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    method === "create"
      ? createReservation(
          { data: { ...form, people: Number(form.people) } },
          abortController.signal
        )
          .then(() => goToReservations())
          .catch(setResError)
      : method === "edit"
      ? updateReservation(
          { ...form, people: Number(form.people) },
          reservationId,
          abortController.signal
        )
          .then(() => goToReservations())
          .catch(setResError)
      : console.log("Nothing performed.");
  };

  const displayForm = () => {
    return (
      <>
        <div className="col-12 my-1">
          <ErrorAlert error={resError} />
        </div>
        <div className="new-reservation-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                required
                type="name"
                className="form-control"
                name="first_name"
                onChange={handleChange}
                // value={form.first_name}
                value={form.first_name}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                required
                type="name"
                className="form-control"
                name="last_name"
                onChange={handleChange}
                value={form.last_name}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                name="mobile_number"
                onChange={handleChange}
                value={form.mobile_number}
              />
            </div>
            <div className="form-group">
              <label>Date of Reservation</label>
              <input
                type="date"
                className="form-control"
                name="reservation_date"
                onChange={handleChange}
                value={form.reservation_date}
              />
            </div>
            <div className="form-group">
              <label>Time of Reservation</label>
              <input
                type="time"
                className="form-control"
                name="reservation_time"
                onChange={handleChange}
                value={form.reservation_time}
              />
            </div>
            <div className="form-group">
              <label>Number of People</label>
              <input
                type="number"
                className="form-control"
                name="people"
                onChange={handleChange}
                value={form.people}
              />
            </div>
            <button className="btn btn-info float-right" type="submit">
              Submit
            </button>
            <button
              onClick={goBack}
              type="button"
              className="btn btn-danger float-right mr-2"
            >
              Cancel
            </button>
          </form>
        </div>
      </>
    );
  };

  return <>{displayForm()}</>;
}

export default ReservationForm;
