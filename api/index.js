const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: [
    "https://indoor-react-frontend-mg7y50mw0-abeerahmed-devs-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// IMPORTANT: apply cors globally
app.use(cors(corsOptions));

// IMPORTANT: handle preflight explicitly
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend working" });
});

module.exports = app;