import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
const app = express();

dotenv.config();

app.use(express.json());

app.post("/api/validate", async (req, res) => {
  let vpa = { vpa: "hmg65@ybl" };
  let username = process.env.NODE_APP_USERNAME;
  let password = process.env.NODE_APP_PASSWORD;

  const body = {
    vpa: "hmg65@ybl",
  };

  const api_response = await fetch(
    "https://api.razorpay.com/v1/payments/validate/vpa",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(username + ":" + password),
      },
    }
  );

  const vpa_res = await api_response.json();
  res.json(vpa_res);
});

const port = process.env.PORT || 3000;
app.listen(port);
