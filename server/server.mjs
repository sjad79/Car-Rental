import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import cars from "./routes/car.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/car", cars);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});