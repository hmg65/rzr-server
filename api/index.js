import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
app.use(cors());
dotenv.config();

app.use(express.json());

let username = process.env.NODE_APP_USERNAME;
let password = process.env.NODE_APP_PASSWORD;

app.get("/api/validate/:vpa", async (req, res) => {
  const vp_add = req.params.vpa;
  const body = {
    vpa: vp_add,
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

app.get("/api/payout/:vpa/:amount", async (req, res) => {
  const vp_add = req.params.vpa;
  const amt = req.params.amount * 100;
  const body = {
    account_number: "7878780014577958",
    amount: amt,
    currency: "INR",
    mode: "UPI",
    purpose: "payout",
    fund_account: {
      account_type: "vpa",
      vpa: {
        address: vp_add,
      },
      contact: {
        name: "Payout for Ripple Txn",
      },
    },
  };

  const api_response = await fetch("https://api.razorpay.com/v1/payouts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(username + ":" + password),
    },
  });

  const vpa_res = await api_response.json();
  res.json(vpa_res);
});

const port = process.env.PORT || 3000;
app.listen(port);
