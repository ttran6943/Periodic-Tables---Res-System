import React, { useState } from "react";
import { useHistory } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api";

function NewTable() {
  const initialForm = {
    table_name: "",
    capacity: "",
  };
  const [form, setForm] = useState(initialForm);
  const [tableError, setTableError] = useState(null);

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleChange = ({ target }) => {
    setForm({ ...form, [target.name]: target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    createTable({ data: { ...form, capacity: Number(form.capacity) } })
      .then(() => history.replace(`/dashboard`))
      .catch(setTableError);
  };

  return (
    <div className="col-12 mt-2">
      <h1 className="mb-3">Create a New Table</h1>
      <div className="col-12">
        <ErrorAlert error={tableError} />
      </div>
      <div className="new-table-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Table Name</label>
            <input
              required
              type="name"
              className="form-control"
              name="table_name"
              onChange={handleChange}
              value={form.table_name}
            />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input
              // required
              type="number"
              className="form-control"
              name="capacity"
              onChange={handleChange}
              value={form.capacity}
            />
          </div>
          <button type="submit" className="btn btn-info mx-1 float-right">
            Submit
          </button>
          <button onClick={goBack} className="btn btn-danger mx-1 float-right">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTable;
