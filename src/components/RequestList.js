import React, { useEffect, useState } from "react";

export default function RequestList() {
  const [requests, setRequests] = useState([]); // State for storing requests
  const [acceptedRequests, setAcceptedRequests] = useState([]); // State for storing accepted requests
  const [cars, setCars] = useState({}); // State for storing car details

  // Fetch the requests from the backend
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("http://localhost:5050/car/getrequests");
        if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          window.alert(message);
          return;
        }

        const requests = await response.json();
        setRequests(requests);

        // Fetch car information for each request
        const carDetails = {};
        await Promise.all(
          requests.map(async (request) => {
            const carResponse = await fetch(`http://localhost:5050/car/${request.carId}`);
            if (carResponse.ok) {
              const car = await carResponse.json();
              carDetails[request.carId] = car; // Store car details by ID
            }
          })
        );

        setCars(carDetails); // Update state with fetched car details
      } catch (error) {
        console.error("Error fetching requests or cars:", error);
      }
    }

    fetchRequests();
  }, []);

  // Handle the "Accept" action
  const handleAccept = async (request) => {
    try {
      const deletePayload = {
        carId: request.carId,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
      };

      // Delete the request from the requests collection
      const deleteResponse = await fetch("http://localhost:5050/car/deleterequest", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deletePayload),
      });

      if (!deleteResponse.ok) {
        const errorMessage = await deleteResponse.text();
        alert(`Failed to delete request: ${errorMessage}`);
        return;
      }

      // Update ONLY the rentedOut field
      const updatePayload = { rentedOut: true };
      const updateResponse = await fetch(`http://localhost:5050/car/${request.carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const errorMessage = await updateResponse.text();
        alert(`Failed to update car rentedOut status: ${errorMessage}`);
        return;
      }

      // Make a POST request to /rentlist
      const rentListPayload = {
        carId: request.carId,
        carModel: cars[request.carId]?.model || "Unknown", // Car model
        carPhoto: cars[request.carId]?.photo || "No image available", // Car photo
        fromDate: request.fromDate, // From date
        toDate: request.toDate, // To date
        customerName: request.customerName, // Customer name
      };

      const rentListResponse = await fetch("http://localhost:5050/car/rentlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rentListPayload),
      });

      if (!rentListResponse.ok) {
        const errorMessage = await rentListResponse.text();
        alert(`Failed to add rental to Rent List: ${errorMessage}`);
        return;
      }

      // Remove request from state and mark as accepted
      alert("Request accepted, car status updated, and rental added to Rent List successfully!");
      setRequests((prevRequests) => prevRequests.filter((req) => req._id !== request._id));
      setAcceptedRequests((prevAccepted) => [...prevAccepted, request._id]);
    } catch (error) {
      console.error("Error accepting request or updating car:", error);
      alert("An error occurred while accepting the request.");
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "green" }}>Requests List</h1>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Car Image</th>
              <th>Car Name</th>
              <th>Customer Name</th>
              <th>Customer Phone</th>
              <th>Request Time</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const car = cars[request.carId]; // Get car details by ID
              return (
                <tr key={request._id}>
                  <td>
                    {car && car.photo ? (
                      <img src={car.photo} alt={car.model} width="100" height="70" />
                    ) : (
                      "Image not available"
                    )}
                  </td>
                  <td>{car ? car.model : "Car details not available"}</td>
                  <td>{request.customerName}</td>
                  <td>{request.customerPhone}</td>
                  <td>{new Date(request.requestTime).toLocaleString()}</td>
                  <td>{request.fromDate || "N/A"}</td>
                  <td>{request.toDate || "N/A"}</td>
                  <td>
                    {acceptedRequests.includes(request._id) ? (
                      <span style={{ color: "green" }}>Accepted</span>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleAccept(request)}
                      >
                        Accept
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}