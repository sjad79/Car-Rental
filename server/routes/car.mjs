import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post("/request", async (req, res) => {
  try {
    // Validate fromDate and toDate fields
    if (!req.body.fromDate || !req.body.toDate) {
      return res.status(400).send("Both fromDate and toDate are required.");
    }

    // Validate the date format (dd-mm-yyyy)
    const isValidDate = (date) => /^\d{2}-\d{2}-\d{4}$/.test(date);
    if (!isValidDate(req.body.fromDate) || !isValidDate(req.body.toDate)) {
      return res.status(400).send("Invalid date format. Use dd-mm-yyyy.");
    }

    // Parse fromDate and toDate
    const [fromDay, fromMonth, fromYear] = req.body.fromDate.split("-").map(Number);
    const [toDay, toMonth, toYear] = req.body.toDate.split("-").map(Number);
    const fromDateObj = new Date(fromYear, fromMonth - 1, fromDay);
    const toDateObj = new Date(toYear, toMonth - 1, toDay);

    // Ensure fromDate is at least 1 day after today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for comparison
    const diffFromDate = Math.ceil((fromDateObj - today) / (1000 * 60 * 60 * 24));
    if (diffFromDate <= 0) {
      return res.status(400).send("From Date must be at least 1 day after today.");
    }

    // Ensure toDate is at least 1 day after fromDate and not exceed 2 weeks
    const diffToDate = Math.ceil((toDateObj - fromDateObj) / (1000 * 60 * 60 * 24));
    if (diffToDate <= 0) {
      return res.status(400).send("To Date must be at least 1 day after From Date.");
    }
    if (diffToDate > 14) {
      return res.status(400).send("To Date must not exceed 2 weeks from From Date.");
    }

    // Extract request details from the body
    const newRequest = {
      carId: new ObjectId(req.body.carId), // ID of the car being requested
      customerName: req.body.customerName, // Name of the customer
      customerPhone: req.body.customerPhone, // Phone number of the customer
      fromDate: req.body.fromDate, // Start date of the rental in dd-mm-yyyy format
      toDate: req.body.toDate, // End date of the rental in dd-mm-yyyy format
      requestTime: new Date(), // Timestamp of the request
    };

    // Save the request in the "requests" collection
    let collection = await db.collection("requests");
    let result = await collection.insertOne(newRequest);

    res.status(201).send(result); // Success response
  } catch (error) {
    console.error("Error while saving request:", error);
    res.status(500).send("An error occurred while saving the request.");
  }
});

// This section will help you fetch all requests
router.get("/getrequests", async (req, res) => {
  try {
    // Fetch all requests from the "requests" collection
    let collection = await db.collection("requests");
    let results = await collection.find({}).toArray();

    res.status(200).send(results);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    res.status(500).send("An error occurred while fetching the requests.");
  }
});


// This section will help you delete a specific request
router.delete("/deleterequest", async (req, res) => {
  try {
    // Extract the request details from the body
    const query = {
      carId: new ObjectId(req.body.carId),
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
    };

    // Delete the request from the "requests" collection
    let collection = await db.collection("requests");
    let result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      res.status(404).send("Request not found.");
    } else {
      res.status(200).send("Request deleted successfully.");
    }
  } catch (error) {
    console.error("Error while deleting request:", error);
    res.status(500).send("An error occurred while deleting the request.");
  }
});


// This section will help you get a list of all the car records
router.get("/", async (req, res) => {
  let collection = await db.collection("cars");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("cars");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new car record
router.post("/", async (req, res) => {
  let newDocument = {
    model: req.body.model,
    specs: req.body.specs,
    rent: req.body.rent,
    photo: req.body.photo,
    rentedOut: false, // Boolean field initialized to false
  };
  let collection = await db.collection("cars");
  let result = await collection.insertOne(newDocument);
  res.status(201).send(result); // Updated status to 201 (resource created)
});


router.put("/:id", async (req, res) => {
  // Validate the car ID
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid car ID.");
  }

  const query = { _id: new ObjectId(req.params.id) }; // Locate the car by its ID

  // Dynamically construct the updates object based on allowed fields in req.body
  const allowedFields = ["model", "specs", "rent", "photo", "rentedOut"];
  const updates = {
    $set: Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {}),
  };

  try {
    let collection = await db.collection("cars");
    let result = await collection.updateOne(query, updates);

    // Response based on matched and modified counts
    if (result.matchedCount === 0) {
      res.status(404).send("Car not found.");
    } else if (result.modifiedCount === 0) {
      res.status(200).send("No changes were made.");
    } else {
      res.status(200).send("Car updated successfully.");
    }
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).send({ error: "An error occurred while updating the car.", details: error.message });
  }
});



// This section will help you delete a car record
router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("cars");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});


router.post("/rentlist", async (req, res) => {
  try {
    // Validate required fields
    const { carId, carModel, carPhoto, fromDate, toDate, customerName } = req.body;

    if (!carId || !carModel || !carPhoto || !fromDate || !toDate || !customerName) {
      return res.status(400).send("All fields are required (carId, carModel, carPhoto, fromDate, toDate, customerName).");
    }

    // Validate the date format (dd-mm-yyyy)
    const isValidDate = (date) => /^\d{2}-\d{2}-\d{4}$/.test(date);
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      return res.status(400).send("Invalid date format. Use dd-mm-yyyy.");
    }

    // Create the new rental entry
    const newRental = {
      carId: new ObjectId(carId),
      carModel,
      carPhoto,
      fromDate,
      toDate,
      customerName,
      rentalTime: new Date(), // Timestamp of the rental creation
    };

    // Save the rental in the "rentlist" collection
    let collection = await db.collection("rentlist");
    let result = await collection.insertOne(newRental);

    res.status(201).send(result); // Success response
  } catch (error) {
    console.error("Error while adding rental to rentlist:", error);
    res.status(500).send("An error occurred while adding the rental.");
  }
});


router.get("/rentlist", async (req, res) => {
  try {
    let collection = await db.collection("rentlist");
    if (!collection) {
      throw new Error("Collection not found");
    }
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (error) {
    console.error("Error while fetching rentlist:", error.message);
    res.status(500).send({ error: "Failed to fetch rentlist", details: error.message });
  }
});

export default router;
