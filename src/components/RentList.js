import React, { useEffect, useState } from "react";

export default function RentList() {
  const [rentList, setRentList] = useState([]); // State for storing rentlist
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(""); // State for error message

  useEffect(() => {
    // Fetch the rentlist from the backend
    async function fetchRentList() {
      setLoading(true); // Start loading
      setError(""); // Clear previous error
      try {
        const response = await fetch("http://localhost:5050/car/rentlist");
        if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          setError(message);
          return;
        }
        const data = await response.json();
        setRentList(data); // Update state with rentlist data
      } catch (error) {
        console.error("Error fetching rentlist:", error);
        setError("An error occurred while fetching the rentlist.");
      } finally {
        setLoading(false); // Stop loading
      }
    }

    fetchRentList();
  }, []);

  const handleTakenBack = async (carId) => {
    setError(""); // Clear previous error
    try {
      // Send PUT request to update the rentedOut field to false
      const updatePayload = { rentedOut: false };
      const response = await fetch(`http://localhost:5050/car/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(`Failed to update car status: ${errorMessage}`);
        return;
      }

      // Update the UI by removing the returned car from rentlist
      alert("Car marked as 'Taken Back' successfully!");
      setRentList((prevRentList) => prevRentList.filter((item) => item.carId !== carId));
    } catch (error) {
      console.error("Error updating car status:", error);
      setError("An error occurred while marking the car as 'Taken Back'.");
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "blue" }}>Rent List</h1>
      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}
      {rentList.length === 0 && !loading ? (
        <p>No items in the Rent List.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Car Image</th>
              <th>Car Model</th>
              <th>Customer Name</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rentList.map((rentItem) => (
              <tr key={rentItem.carId}>
                <td>
                  <img
                    src={rentItem.carPhoto}
                    alt={rentItem.carModel}
                    width="100"
                    height="70"
                  />
                </td>
                <td>{rentItem.carModel}</td>
                <td>{rentItem.customerName}</td>
                <td>{rentItem.fromDate}</td>
                <td>{rentItem.toDate}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleTakenBack(rentItem.carId)}
                  >
                    Taken Back
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}