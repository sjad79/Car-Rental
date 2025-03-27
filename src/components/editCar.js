import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

export default function Edit() {
  const [form, setForm] = useState({
    model: "",
    specs: "",
    rent: "",
  });

  const [image, setImage] = useState(""); // To store the current image URL or new file
  const [newImageFile, setNewImageFile] = useState(null); // To store a newly uploaded image file
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/car/${id}`)
      .then((response) => {
        updateForm(response.data);
        setImage(response.data.photo); // Set the existing image URL
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch car details.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request is completed
      });
  }, [id]);

  // Function to handle new image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file); // Store the new file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Show preview of the new image
      };
      reader.readAsDataURL(file);
    }
  };

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => ({ ...prev, ...value }));
  }

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();

    // Start loading
    setLoading(true);
    setError("");

    try {
      let photoUrl = image; // Use existing image URL by default

      // If there's a new image file, upload it to Cloudinary
      if (newImageFile) {
        const data = new FormData();
        data.append("file", newImageFile);
        data.append("upload_preset", "whmfp3k5");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dhjiwjl87/image/upload",
          data
        );

        photoUrl = res.data.secure_url; // Update with new image URL
      }

      // Prepare the updated car object
      const updatedCar = { ...form, photo: photoUrl };

      console.log(updatedCar);

      // Update car data in the backend
      const response = await fetch(`http://localhost:5050/car/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCar),
      });

      if (!response.ok) {
        throw new Error(`Failed to update car: ${response.statusText}`);
      }

      // Redirect to admin page after successful update
      setLoading(false);
      navigate("/admin999");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while updating the car.");
      setLoading(false); // Stop loading
    }
  }

  // Form UI
  return (
    <div>
      <h3>Edit Car</h3>
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
            value={form.specs}
            onChange={(e) => updateForm({ specs: e.target.value })}
          />
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
          <br />
          {image && (
            <img
              src={image}
              alt="Selected"
              style={{ width: "300px", height: "auto", marginBottom: "1rem" }}
            />
          )}
          <input
            type="file"
            className="form-control"
            id="photo"
            onChange={handleImageChange}
          />
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Edit Car"
            className="btn btn-primary"
            disabled={loading} // Disable submit button while loading
          />
        </div>
      </form>
    </div>
  );
}