import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Create() {
  const [form, setForm] = useState({
    model: "",
    rent: "",
  });

  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const navigate = useNavigate();

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => ({ ...prev, ...value }));
  }

  const [specs, setSpecs] = useState([]);
  const [currentSpec, setCurrentSpec] = useState("");

  const handleAddSpec = () => {
    if (currentSpec.trim() !== "") {
      setSpecs([...specs, currentSpec]);
      setCurrentSpec("");
    }
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = specs.filter((_, specIndex) => specIndex !== index);
    setSpecs(newSpecs);
  };

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();

    // Start loading
    setLoading(true);
    setError("");

    const files = image;
    const data = new FormData();
    data.append("file", files);
    data.append("upload_preset", "whmfp3k5");

    try {
      // Upload image to Cloudinary
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dhjiwjl87/image/upload",
        data
      );
      const newCar = {
        ...form,
        photo: res.data.secure_url,
        specs: specs,
      };

      // Submit new car data to the backend
      const response = await fetch("http://localhost:5050/car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCar),
      });

      if (!response.ok) {
        throw new Error(`Failed to create car: ${response.statusText}`);
      }

      // Clear form and redirect
      setForm({ model: "", rent: "", photo: "" });
      setSpecs([]);
      setCurrentSpec("");
      setLoading(false); // Stop loading
      navigate("/admin999");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while creating the car.");
      setLoading(false); // Stop loading
    }
  }

  return (
    <div>
      <h3>Create New Car</h3>
      {/* Show loading spinner or error message */}
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {error && (
        <div
          style={{
            color: "red",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            className="form-control"
            id="model"
            value={form.model}
            onChange={(e) => updateForm({ model: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="specs">Specs</label>
          <input
            type="text"
            className="form-control"
            id="specs"
            value={currentSpec}
            onChange={(e) => setCurrentSpec(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddSpec}
            style={{ marginTop: "5px" }}
          >
            Add Spec
          </button>
          <ul style={{ paddingLeft: "1rem" }}>
            {specs.map((spec, index) => (
              <li key={index}>
                {spec}{" "}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveSpec(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-group">
          <label htmlFor="rent">Rent</label>
          <input
            type="text"
            className="form-control"
            id="rent"
            value={form.rent}
            onChange={(e) => updateForm({ rent: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="photo">Photo</label>
          <input
            type="file"
            className="form-control"
            id="photo"
            onChange={(e) => {
              setImage(e.target.files[0]);
            }}
          />
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Create Car"
            className="btn btn-primary"
            disabled={loading} // Disable submit button while loading
          />
        </div>
      </form>
    </div>
  );
}