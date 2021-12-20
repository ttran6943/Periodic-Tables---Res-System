import React from "react";
import ReservationForm from "../components/ReservationForm";

function NewReservation() {
  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };
  const newReservationForm = () => {
    return (
      <>
        <ReservationForm method={"create"} initialForm={initialForm} />
      </>
    );
  };

  return (
    <div className="col-12">
      <h1 className="mt-2 mb-3">Create a New Reservation</h1>
      <div className="new-reservation">{newReservationForm()}</div>
    </div>
  );
}

export default NewReservation;
