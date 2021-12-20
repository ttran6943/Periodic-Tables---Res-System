/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const requestOptions = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, requestOptions);
}

export async function createReservation(reqBody, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify(reqBody),
    signal,
  };
  return await fetchJson(url, requestOptions, {});
}

export async function createTable(reqBody, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify(reqBody),
    signal,
  };
  return await fetchJson(url, requestOptions, {});
}

export async function updateTable(tableId, reservationId, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
  const requestOptions = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id: reservationId } }),
    signal,
  };
  return await fetchJson(url, requestOptions, []);
}

export async function deleteTable(tableId, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
  const requestOptions = {
    method: "DELETE",
    headers,
    body: JSON.stringify({ data: { reservation_id: null } }),
    signal,
  };
  return await fetchJson(url, requestOptions, {});
}

export async function finishTable(table_id, reservation_id) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "DELETE",
    headers,
  };
  return await fetchJson(url, options, {});
}

export async function updateReservationStatus(reservationId, status, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservationId}/status`);
  const requestOptions = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status: status } }),
    signal,
  };
  return await fetchJson(url, requestOptions, {});
}

export async function findReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options, {})
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function updateReservation(updatedRes, reservation_id, signal) {
  const { reservation_date, reservation_time } = updatedRes;
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);

  const data = {
    ...updatedRes,
    reservation_date: Array.isArray(reservation_date)
      ? reservation_date[0]
      : reservation_date,
    reservation_time: Array.isArray(reservation_time)
      ? reservation_time[0]
      : reservation_time,
  };

  const requestOptions = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: data }),
    signal,
  };
  const response = await fetchJson(url, requestOptions, updatedRes);

  return Array.isArray(response) ? response[0] : response;
}

export async function searchResByMobileNumber(mobile_number, signal) {
  const url = new URL(
    `${API_BASE_URL}/reservations?mobile_number=${mobile_number}`
  );
  const requestOptions = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, requestOptions, {});
}
