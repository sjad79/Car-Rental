import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Car(props) {
  const [showForm, setShowForm] = useState(false); // State to toggle the form
  const [customerName, setCustomerName] = useState(""); // State for customer name
  const [customerPhone, setCustomerPhone] = useState(""); // State for customer phone number
  const [fromDate, setFromDate] = useState(""); // State for from-date
  const [toDate, setToDate] = useState(""); // State for to-date
  const [error, setError] = useState(""); // State for validation errors
  const navigate = useNavigate();
  const location = useLocation();

  
  const validateDate = (date) => {
    const regex = /^\d{2}-\d{2}-\d{4}$/; // Format: dd-mm-yyyy
    if (!regex.test(date)) {
      return false;
    }

    const [day, month, year] = date.split("-").map(Number);
    const jsDate = new Date(year, month - 1, day); // Convert to JavaScript Date
    return jsDate.getDate() === day && jsDate.getMonth() === month - 1 && jsDate.getFullYear() === year;
  };

  const handleRequestSubmit = async () => {
    setError(""); // Clear previous errors

    // Validate fromDate format
    if (!validateDate(fromDate)) {
      setError("Invalid From Date format. Please use dd-mm-yyyy.");
      return;
    }

    // Validate toDate format
    if (!validateDate(toDate)) {
      setError("Invalid To Date format. Please use dd-mm-yyyy.");
      return;
    }

    // Ensure fromDate is at least 1 day after today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight
    const [fromDay, fromMonth, fromYear] = fromDate.split("-").map(Number);
    const fromDateObj = new Date(fromYear, fromMonth - 1, fromDay);
    const diffFromDate = Math.ceil((fromDateObj - today) / (1000 * 60 * 60 * 24)); // Difference in days

    if (diffFromDate <= 0) {
      setError("From Date must be at least 1 day after today.");
      return;
    }

    // Ensure toDate is at least 1 day after fromDate and not exceed 2 weeks
    const [toDay, toMonth, toYear] = toDate.split("-").map(Number);
    const toDateObj = new Date(toYear, toMonth - 1, toDay);
    const diffToDate = Math.ceil((toDateObj - fromDateObj) / (1000 * 60 * 60 * 24)); // Difference in days

    if (diffToDate <= 0) {
      setError("To Date must be at least 1 day after From Date.");
      return;
    }

    if (diffToDate > 14) {
      setError("To Date must not exceed 2 weeks from From Date.");
      return;
    }

    // Prepare the request payload
    const requestPayload = {
      carId: props.car._id,
      customerName: customerName,
      customerPhone: customerPhone,
      fromDate: fromDate, // Include the selected from date
      toDate: toDate,     // Include the selected to date
    };

    // Make the POST request to the /request endpoint
    const response = await fetch("http://localhost:5050/car/request/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (response.ok) {
      alert("Request submitted successfully!");
      setShowForm(false); // Hide the form after submission
    } else {
      const errorMessage = await response.text();
      alert(`Failed to submit request: ${errorMessage}`);
    }
  };

  return (
    <div className="card" style={{ width: "18rem", margin: "1rem" }}>
      <img
        src={props.car.photo}
        className="card-img-top"
        alt={props.car.model}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title">
          <strong>Model: </strong>{props.car.model}
        </h5>
        <div className="card-text">
          <strong>Specs:</strong>
          <ul>
            {(Array.isArray(props.car.specs) ? props.car.specs : []).map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
          <strong>Rent:</strong> ${props.car.rent} per day
          <br />
          {/* Availability Indicator */}
          <div
            style={{
              backgroundColor: props.car.rentedOut ? "red" : "green",
              color: "white",
              padding: "5px",
              textAlign: "center",
              borderRadius: "5px",
              marginTop: "10px",
            }}
          >
            {props.car.rentedOut ? "Rented Out" : "Available"}
          </div>
        </div>

        {/* Conditional rendering based on the current path */}
        {location.pathname.startsWith("/admin999") ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/admin999/editCar/${props.car._id}`)}
              style={{ marginRight: "5px" }}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => props.deleteCar(props.car._id)}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-success btn-sm"
              onClick={() => setShowForm(true)}
            >
              Make Request
            </button>

            {/* Show form when "Make Request" is clicked */}
            {showForm && (
              <div className="mt-3">
                {error && (
                  <div style={{ color: "red", marginBottom: "10px" }}>
                    {error}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: "5px" }}
                />
                <input
                  type="text"
                  placeholder="Your Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: "5px" }}
                />
                <input
                  type="text"
                  placeholder="From Date (dd-mm-yyyy)"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: "5px" }}
                />
                <input
                  type="text"
                  placeholder="To Date (dd-mm-yyyy)"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: "5px" }}
                />
                <button
                  onClick={handleRequestSubmit}
                  className="btn btn-primary btn-sm"
                  style={{ marginRight: "5px" }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CarList() {
  const [cars, setCars] = useState([]);

  // Fetch records from the database.
  useEffect(() => {
    async function getCars() {
      const response = await fetch(`http://localhost:5050/car/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const cars = await response.json();
      setCars(cars);
    }

    getCars();
  }, [cars.length]);

  // Delete a record
  async function deleteCar(id) {
    await fetch(`http://localhost:5050/car/${id}`, {
      method: "DELETE",
    });

    const newCars = cars.filter((el) => el._id !== id);
    setCars(newCars);
  }

  // Map out the records on the table
  function carList() {
    return cars.map((car) => (
      <Car car={car} deleteCar={() => deleteCar(car._id)} key={car._id} />
    ));
  }

  // Display the cars in a grid layout
  return (
    <div className="container">
      <div className="row">
        <h1 style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
          Cars List
        </h1>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        {carList()}
      </div>
    </div>
  );
}
