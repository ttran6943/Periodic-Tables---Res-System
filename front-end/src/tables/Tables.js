import React from "react";
import { useEffect, useState } from "react";
// import { useHistory } from "react-router";
import { listTables } from "../utils/api";
// import { deleteTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Tables({ finishHandler, refresh }) {
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  // const [refresh, setRefresh] = useState(null);

  // const history = useHistory();

  // const finishHandler = async (tableId) => {
  //   const abortController = new AbortController();

  //   if (
  //     window.confirm(
  //       "Is this table ready to seat new guests? This cannot be undone."
  //     )
  //   ) {
  //     deleteTable(tableId, abortController.signal)
  //       .then(() => (refresh === false ? setRefresh(true) : setRefresh(false)))
  //       .catch(setTablesError);
  //   }
  // };

  useEffect(() => {
    const abortController = new AbortController();
    setTablesError(null);
    async function loadTables() {
      listTables(abortController.signal).then(setTables).catch(setTablesError);
      return () => abortController.abort();
    }
    loadTables();
  }, [refresh]);

  const displayTables = () => {
    return (
      <div className="col justify-content-around">
        <div className="row justify-content-between">
          {tables.map((table) => {
            return (
              <div
                key={table.table_name}
                className="card my-2 col-lg-3 col-md-12 col-sm-12 "
              >
                <div className="card-body">
                  <h5 className="card-title">{`Table Name: ${table.table_name}`}</h5>
                  <p className="card-text">{`Table ID: ${table.table_id}`}</p>
                  <p>{`Capacity: ${table.capacity}`}</p>
                  {table.reservation_id ? (
                    <>
                      <p data-table-id-status={`${table.table_id}`}>
                        Status: Occupied
                      </p>
                      <button
                        onClick={() => finishHandler(table.table_id)}
                        className="btn btn-danger float-right"
                        data-table-id-finish={table.table_id}
                      >
                        Finish
                      </button>
                    </>
                  ) : (
                    <p data-table-id-status={`${table.table_id}`}>
                      Status: Free
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col">
        <ErrorAlert error={tablesError} />
      </div>
      <div className="col">{displayTables()}</div>
    </>
  );
}
export default Tables;
