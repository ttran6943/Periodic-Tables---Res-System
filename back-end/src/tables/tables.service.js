const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function read(tableId) {
  return knex("tables").select("*").where({ table_id: tableId }).first();
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdTable) => createdTable[0]);
}

function update(tableId, reservationId) {
  return knex("tables")
    .select("*")
    .where({ table_id: tableId })
    .update({ reservation_id: reservationId });
}

function removeReservation(tableId) {
  return knex("tables")
    .where({ table_id: tableId })
    .update({ reservation_id: null})
}

module.exports = {
  list,
  read,
  update,
  create,
  removeReservation,
};
