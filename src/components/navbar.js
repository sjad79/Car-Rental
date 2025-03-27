import React from "react";
import "bootstrap/dist/css/bootstrap.css"; // Importing Bootstrap
import { NavLink, useLocation } from "react-router-dom"; // Importing NavLink and useLocation

// Navbar Component
export default function Navbar() {
  const location = useLocation(); // Get the current location

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          {/* Dynamically adjust the "HOME" link */}
          <NavLink
            className="navbar-brand"
            to={location.pathname.startsWith("/admin999") ? "/admin999" : "/"}
          >
            HOME
          </NavLink>

          {/* Conditionally render the buttons for /admin999 */}
          {location.pathname.startsWith("/admin999") && (
            <div className="d-flex">
              <NavLink
                className="btn btn-primary me-2"
                to="/admin999/rentlist"
                style={{ marginRight: "10px" }}
              >
                Rent List
              </NavLink>
              <NavLink
                className="btn btn-primary me-2"
                to="/admin999/getrequests"
                style={{ marginRight: "10px" }}
              >
                View Requests
              </NavLink>
              <NavLink className="btn btn-success" to="/admin999/create">
                Create New Car
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}