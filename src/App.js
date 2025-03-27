import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";
import CarsList from "./components/carsList";
import Navbar from "./components/navbar";
import Create from "./components/createCar";
import Edit from "./components/editCar";
import RequestList from "./components/RequestList";
import RentList from "./components/RentList";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route exact path="/admin999" element={<CarsList />} />
        <Route exact path="/admin999/getrequests" element={<RequestList />} />
        <Route exact path="/admin999/rentlist" element={<RentList />} />
        <Route exact path="/" element={<CarsList />} />
        <Route path="/admin999/create" element={<Create />} />
        <Route path="/admin999/editCar/:id" element={<Edit />} />
      </Routes>
    </div>
  );
};

export default App;
