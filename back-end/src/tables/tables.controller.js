const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const VALID_TABLE_PROPERTIES = ["table_name", "capacity", "reservation_id"];

async function validateTableHasProperties(req, res, next) {
  const { data } = req.body;

  if (!data) {
    return next({
      status: 400,
      message: "Data is missing.",
    });
  }

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_TABLE_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

async function validateBody(req, res, next) {
  const { data: { table_name, capacity } = {} } = req.body;

  let error;
  if (!table_name) {
    error = "table_name is missing.";
  } else if (table_name.length < 2) {
    error = "table_name must be greater than 2 characters long.";
  } else if (!capacity) {
    error = "Table capacity is missing.";
  } else if (capacity < 1) {
    error = "Table capacity must be greater than 1.";
  } else if (Number.isInteger(capacity) === false) {
    error = "Table capacity must be a number.";
  }

  if (error) {
    return next({
      status: 400,
      message: error,
    });
  }
  return next();
}

async function create(req, res, next) {
  const createTable = await service.create(req.body.data);
  res.status(201).json({ data: createTable });
}

async function list(req, res, next) {
  const response = await service.list();
  res.json({ data: response });
}

async function updateBodyValidation(req, res, next) {
  if (!req.body.data) {
    next({
      status: 400,
      message: "No data found.",
    });
  }

  const { table_id } = req.params;
  const { reservation_id } = req.body.data;

  if (!table_id) {
    return next({
      status: 400,
      message: "Missing table_id.",
    });
  } else if (!reservation_id) {
    return next({
      status: 400,
      message: "Missing reservation_id.",
    });
  }

  //Check if reservation_id is valid and exists

  const foundReservation = await reservationService.read(reservation_id);
  if (!foundReservation) {
    return next({
      status: 404,
      message: `No reservation with reservation_id: ${reservation_id}.`,
    });
  } else if (foundReservation) {
    res.locals.reservation = foundReservation;
  }

  //Check if table is already assigned a reservation_id
  const table = res.locals.table;
  if (table.reservation_id) {
    return next({
      status: 400,
      message: `Table already occupied by reservation_id: ${table.reservation_id}.`,
    });
  }

  //Check if table capacity meets reservation capacity
  if (foundReservation && table.capacity < res.locals.reservation.people) {
    return next({
      status: 400,
      message: `Table capacity (${table.capacity}) exceeded. Find a table with a capacity greater than ${res.locals.reservation.people}`,
    });
  }

  next();
}

async function checkTableExists(req, res, next) {
  const { table_id } = req.params;
  const tableExists = await service.read(table_id);
  if (!tableExists) {
    return next({
      status: 400,
      message: `Table_id: ${table_id} does not exist.`,
    });
  } else if (tableExists) {
    res.locals.table = tableExists;
    return next();
  }
}

async function checkIfReservationIsSeated(req, res, next) {
  if (res.locals.reservation.status === "seated") {
    return next({
      status: 400,
      message: `Reservation ID ${res.locals.reservation.reservation_id} has already been seated.`,
    });
  }
  return next();
}

async function checkTableExistsBeforeDelete(req, res, next) {
  const { table_id } = req.params;
  const tableExists = await service.read(table_id);
  if (!tableExists) {
    return next({
      status: 404,
      message: `Table_id: ${table_id} does not exist.`,
    });
  } else if (tableExists) {
    res.locals.table = tableExists;
    return next();
  }
}

async function checkTableIsOccupied(req, res, next) {
  const table = res.locals.table;
  if (!table.reservation_id) {
    return next({
      status: 400,
      message: `Table is not occupied.`,
    });
  }
  return next();
}

async function updateTableWithRes(req, res, next) {
  const { table_id } = req.params;
  const data = { status: "seated" };
  const reservationId = res.locals.reservation.reservation_id;
  await reservationService.updateStatus(reservationId, data);
  const updatedTable = await service.update(table_id, reservationId);

  res.json({ data: updatedTable });
}

async function setResStatusToFinished(req, res, next) {
  const reservationId = res.locals.table.reservation_id;
  const data = { status: "finished" };
  await reservationService.updateStatus(reservationId, data);
  next();
}

async function destroyResID(req, res, next) {
  const tableId = res.locals.table.table_id;
  const deletedResID = await service.removeReservation(tableId);
  res.status(200).json({ data: deletedResID });
}

module.exports = {
  list: asyncErrorBoundary(list),
  update: [
    asyncErrorBoundary(checkTableExists),
    asyncErrorBoundary(updateBodyValidation),
    checkIfReservationIsSeated,
    asyncErrorBoundary(updateTableWithRes),
  ],
  create: [
    validateBody,
    validateTableHasProperties,
    asyncErrorBoundary(create),
  ],
  destroy: [
    asyncErrorBoundary(checkTableExistsBeforeDelete),
    checkTableIsOccupied,
    asyncErrorBoundary(setResStatusToFinished),
    asyncErrorBoundary(destroyResID),
  ],
};
