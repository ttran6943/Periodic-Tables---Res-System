const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//MIDDLEWARES//

//-Defines valid keys-//
const VALID_RESERVATION_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

//-Checks request body if data exists or if there are any invalid fields in the request body-//
function hasOnlyValidProperties(req, res, next) {
  const { data } = req.body;

  if (!data) {
    return next({
      status: 400,
      message: "Data is missing.",
    });
  }

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_RESERVATION_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

//-Takes the request data and validates each key value-//
async function validateBody(req, res, next) {
  const {
    data: {
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
      status,
    } = {},
  } = req.body;

  const time = reservation_time;
  if (!time) {
    return next({
      status: 400,
      message: "reservation_time is missing.",
    });
  }

  const resDate = reservation_date;
  if (!resDate) {
    return next({
      status: 400,
      message: "reservation_date is missing.",
    });
  }

  //Regex for time and date//
  const date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  const time_regex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;

  const formatDate = (date) => {
    if (date) {
      const year = date.substring(0, 4);
      const month =
        date.substring(5, 7) < 10
          ? date.substring(5, 7).substring(1, 2) - 1
          : date.substring(5, 7) - 1;
      const day = date.substring(8, 10);

      let d = new Date();
      d.setFullYear(year);
      d.setMonth(month);
      d.setDate(day);

      return d;
    }
  };

  const checkIfTuesday = () => {
    const date = resDate;
    return formatDate(date).getDay();
  };

  const checkIfAfterOpening = () => {
    const openTime = new Date();
    const hms = time.split(":");
    const resTime = new Date();
    resTime.setHours(hms[0]);
    resTime.setMinutes(hms[1]);
    resTime.setSeconds(0);
    openTime.setHours(10);
    openTime.setMinutes(30);
    openTime.setSeconds(0);

    if (resTime.getTime() - openTime.getTime() < 0) {
      return false;
    } else {
      return true;
    }
  };

  const checkIfAfterHours = () => {
    const closingTime = new Date();
    const hms = time.split(":");
    const resTime = new Date();
    resTime.setHours(hms[0]);
    resTime.setMinutes(hms[1]);
    resTime.setSeconds(0);
    closingTime.setHours(21);
    closingTime.setMinutes(30);
    closingTime.setSeconds(0);

    if (closingTime.getTime() - resTime.getTime() < 0) {
      return false;
    } else {
      return true;
    }
  };

  const checkIfPast = () => {
    const date = formatDate(reservation_date);
    const currentDate = new Date(Date.now());
    const time = reservation_time;
    const hms = time; // your input string
    const a = hms.split(":"); // split it at the colons
    date.setHours(a[0]);
    date.setMinutes(a[1]);
    date.setSeconds(0);
    return date - currentDate;
  };

  let error;

  if (!first_name || first_name === null || first_name === "") {
    error = "Must provide a first_name for the reservation.";
  } else if (!last_name || last_name === null || last_name === "") {
    error = "Must provide a last_name for the reservation.";
  } else if (!mobile_number || mobile_number === null || mobile_number === "") {
    error = "mobile_number must be provided.";
  } else if (
    !reservation_date ||
    reservation_date === null ||
    reservation_date === "" ||
    !date_regex.test(reservation_date)
  ) {
    error = "Invalid reservation_date.";
  } else if (checkIfTuesday() === 2) {
    error = "Restaurant is closed on Tuesdays.";
  } else if (checkIfAfterHours() === false) {
    error = "Restaurant stops accepting reservations past 9:30PM.";
  } else if (checkIfAfterOpening() === false) {
    error = "Restaurant begins acceping reservations starting 10:30AM.";
  } else if (
    !reservation_time ||
    reservation_time === null ||
    reservation_time === "" ||
    !time_regex.test(reservation_time)
  ) {
    error = "Invalid reservation_time.";
  } else if (checkIfPast() < 0) {
    error = "Can only accept future dates for reservations.";
  } else if (checkIfAfterOpening() === false) {
    error = "Restaurant opens at 10:30AM.";
  } else if (
    !people ||
    people === null ||
    people < 1 ||
    Number.isInteger(people) === false
  ) {
    error = "Number of people must be greater than 0.";
  } else if (status === "seated") {
    error = "Reservation has already been seated.";
  } else if (status === "finished") {
    error = "Reservation has already finished.";
  }

  if (error) {
    return next({
      status: 400,
      message: error,
    });
  }
  next();
}

//-If request is a search, then perform search service-//
async function isSearch(req, res, next) {
  if (req.query.mobile_number && !req.query.date) {
    const result = await service.search(req.query.mobile_number);
    res.status(200).json({ data: result });
  } else if (req.query.date && !req.query.mobile_number) {
    const result = await service.listDateQuery(req.query.date);
    res.json({ data: result });
  } else if (req.query.mobile_number === "") {
  } else {
    return next();
  }
}

//-Checks if reservation with the reservation_id exists-//
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundReservation = await service.read(reservation_id);

  if (foundReservation) {
    res.locals.reservation = foundReservation;
    return next();
  } else if (!foundReservation) {
    return next({
      status: 404,
      message: `Reservation with reservation_id: ${reservation_id} not found.`,
    });
  }
}

const VALID_RESERVATION_STATUS_PROPERTIES = ["status"];

//-Checks if body of the request has a status key and value-//
async function hasOnlyValidStatusProperties(req, res, next) {
  const { data } = req.body;

  if (!data) {
    return next({
      status: 400,
      message: "Data is missing.",
    });
  }
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_RESERVATION_STATUS_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

//-Checks if the status is a valid status-//
async function validateBodyStatusUpdate(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (
    !status ||
    (status !== "seated" &&
      status !== "finished" &&
      status !== "booked" &&
      status !== "cancelled")
  ) {
    return next({
      status: 400,
      message: "Missing or unknown status.",
    });
  }
  return next();
}

//-Checks if the reservation status is already finished-//
async function checkReservationStatusIfFinished(req, res, next) {
  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: `Reservation ID ${res.locals.reservation.reservation_id} has already finished.`,
    });
  }
  return next();
}

//HANDLERS//

//-List handler for reservation service-//
async function list(req, res) {
  const result = await service.list();
  res.json({ data: result });
}

//-Post handler for reservation service-//
async function createReservation(req, res, next) {
  const result = await service.create(req.body.data);
  // console.log(result)
  res.status(201).json({ data: result });
}

//-Get handler for reservation service-//
async function read(req, res, next) {
  const { reservation_id } = req.params;
  const result = await service.read(reservation_id);
  res.status(200).json({ data: result });
}

//-Put handler for reservation status service-//
async function updateReservationStatus(req, res, next) {
  const { data } = req.body;
  const reservation_id = res.locals.reservation.reservation_id;
  await service.updateStatus(reservation_id, req.body.data);
  res.json({ data: { status: data.status } });
}

//-Put handler for reservation update service-//
async function updateReservation(req, res, next) {
  const updatedData = req.body.data;
  const { reservation_id } = req.params;
  const data = await service.updateReservation(reservation_id, updatedData);
  res.json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(isSearch), asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    validateBody,
    asyncErrorBoundary(createReservation),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasOnlyValidProperties),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(updateReservation),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(validateBodyStatusUpdate),
    asyncErrorBoundary(hasOnlyValidStatusProperties),
    asyncErrorBoundary(checkReservationStatusIfFinished),
    asyncErrorBoundary(updateReservationStatus),
  ],
};
