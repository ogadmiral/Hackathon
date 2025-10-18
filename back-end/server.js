import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/callback";

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

// Step 1: Redirect user to 42 OAuth
app.get("/login", (req, res) => {
  const redirectURL = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code`;
  res.redirect(redirectURL);
});

// Step 2: Handle callback and exchange code for token
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });
  const user = await userResponse.json();

  res.send(`<h1>Welcome, ${user.login}!</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
