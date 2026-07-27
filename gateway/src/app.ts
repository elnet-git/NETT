import express from "express";
import axios from "axios";

export const app = express();

app.use(express.json());

app.post("/trips", async (req, res) => {
  const response = await axios.post(
    "http://localhost:4001/trips",
    req.body
  );

  res.json(response.data);
});