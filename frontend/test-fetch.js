const fetch = require("node-fetch");

fetch("http://localhost:5000/api/health")
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => console.log("Response:", text))
  .catch(err => console.error("Error:", err.message));
