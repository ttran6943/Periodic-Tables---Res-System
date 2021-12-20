const knex = require("../db/connection");

function list() {
  return knex("reservations")
    .select("*")
    .orderBy("reservation_time");
}

function listDateQuery(query) {
  return knex("reservations")
    .select("*")
    .whereNot({ status: "finished" })
    .where({ reservation_date: query })
    .orderBy("reservation_time");
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRes) => createdRes[0]);
}

function read(reservationId) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservationId })
    .first();
}

function updateStatus(reservationId, data) {
  return knex("reservations")
    .where({ reservation_id: reservationId })
    .update({ status: data.status })
    .returning("*")
    .then((rows) => rows[0]);
}

function updateReservation(reservationId, updatedData) {
  return knex("reservations")
    .where({ reservation_id: reservationId })
    .update(updatedData)
    .returning("*")
    .then((rows) => rows[0]);
}

module.exports = {
  search,
  listDateQuery,
  list,
  create,
  read,
  updateStatus,
  updateReservation,
};
