const express = require("express");
const { session } = require("./pipeline");

const app = express();
const PORT = 3000;

// נקודת גישה שמריצה את הפייפליין
app.get("/run", async (req, res) => {
  try {
    console.log("Starting Puppeteer session...");
    const result = await session();
    res.send(`Pipeline finished: ${result}`);
  } catch (err) {
    console.error("Pipeline failed:", err);
    res.status(500).send("Error running pipeline");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
