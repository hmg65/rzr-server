import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import xrpl from "xrpl";
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

app.get("/api/xrpl/create", async (req, res) => {
 
  const client = new xrpl.Client('wss://xrplcluster.com');
  await client.connect();
  const wallet = xrpl.Wallet.generate();

  const data = {
    address: wallet.address,
    seed: wallet.seed
  };
  res.json(data);
});


app.get("/api/xrpl/accountInfo/:address", async (req, res) => {
 
  const client = new xrpl.Client('wss://xrplcluster.com');
  await client.connect();

  const response = await client.request({
    "command": "account_info",
    "account": req.params.address,
    "ledger_index": "validated"
  })

  res.json(response);
  client.disconnect();
});

app.get("/api/xrpl/test/create", async (req, res) => {
 
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  const fund_result = await client.fundWallet()
  const wallet = fund_result.wallet

  res.json(wallet);
  client.disconnect();
});

app.get("/api/xrpl/test/accountInfo/:address", async (req, res) => {
 
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const response = await client.request({
    "command": "account_info",
    "account": req.params.address,
    "ledger_index": "validated"
  })

  res.json(response);
  client.disconnect();
});

app.get("/api/xrpl/test/txn/:seed/:amount", async (req, res) => {
 
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const wallet = xrpl.Wallet.fromSeed(req.params.seed);

  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet.address,
    "Amount": xrpl.xrpToDrops(req.params.amount),
    "Destination": "rpXrMHcnEZy23Wcbf8Ja4C88XCZ4ZMLQLn"
  })
 
  const signed = wallet.sign(prepared)
  const tx = await client.submitAndWait(signed.tx_blob)

  const data = {
    transactionCost: xrpl.dropsToXrp(prepared.Fee),
    transactionResult: tx.result.meta.TransactionResult,
    identifyingHash: signed.hash
  };


  res.json(data);
  client.disconnect();
});



const port = process.env.PORT || 3000;
app.listen(port);
