import express, { Request, Response } from "express";
import axios from "axios";

const app = express();

app.use(express.json());

app.post("/trips", async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/trips",
      req.body
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Gateway error:", error);

    return res.status(500).json({
      error: "Trips Service unavailable",
    });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send("🚪 NETT Gateway OK");
});

app.listen(3000, () => {
  console.log("🚪 Gateway running on http://localhost:3000");
});

export default app;