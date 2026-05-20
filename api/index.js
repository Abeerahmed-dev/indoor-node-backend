import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend working"
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API route working"
  });
});

export default app;