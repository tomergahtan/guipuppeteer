const express = require("express");
const { sessionStart } = require("./pipeline");

const app = express();
const PORT = 24000;

// נקודת גישה שמריצה את הפייפליין
app.get("/run", async (req, res) => {
  try {
    console.log("Starting Puppeteer session...");
    const result = await sessionStart(req.body);
    res.send(result);
  } catch (err) {
    console.error("Pipeline failed:", err);
    res.status(500).send("Error running pipeline");
  }
});

app.post("continue", async (req, res) => {
  try {
    const { endpoint, caseName } = req.body;
    const result = await continueSession(endpoint, caseName);
    res.send(result);
  } catch (err) {
    console.error("Error continuing pipeline:", err);
    res.status(500).send("Error continuing pipeline");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
