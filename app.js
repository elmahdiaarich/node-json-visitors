const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "visits.json");

// Mutex simple pour éviter l'écriture concurrente
let lock = false;

// Lire le compteur
function readCounter() {
  try {
    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(FILE, JSON.stringify({ count: 0 }, null, 2));
    }
    const data = fs.readFileSync(FILE);
    return JSON.parse(data).count;
  } catch (err) {
    console.error("Erreur lecture JSON:", err);
    return 0;
  }
}

// Écrire le compteur
function writeCounter(count) {
  try {
    fs.writeFileSync(FILE, JSON.stringify({ count }, null, 2));
  } catch (err) {
    console.error("Erreur écriture JSON:", err);
  }
}

// Route principale
app.get("/", async (req, res) => {
  // Attente si une écriture est en cours
  while (lock) {
    await new Promise(r => setTimeout(r, 10));
  }
  lock = true;

  try {
    let count = readCounter();
    count++;
    writeCounter(count);

    const hostname = req.hostname;
    const port = req.socket.localPort;
    const serverIP = req.socket.localAddress;
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: red; font-size: 48px;">Testing Docker Image</h1>
        <h2 style="color: gray; font-size: 24px;">Par El Mahdi Aarich</h2>
        <h2 style="color: darkblue;">Compteur de visites</h2>
        <p style="font-size: 24px;"><strong>Nombre de visites :</strong> <span style="color: green;">${count}</span></p>
        <hr style="width: 50%; margin: 20px auto;">
        <h3 style="color: purple;">Infos serveur</h3>
        <p>Hostname: https://elmahdiaarich-docker-bqc2ckhnexa5e3ft.francecentral-01.azurewebsites.net/</p>
        <p>Port: ${port}</p>
        <p>IP serveur: ${serverIP}</p>
        <hr style="width: 50%; margin: 20px auto;">
        <h3 style="color: purple;">Infos client</h3>
        <p>IP client: ${clientIP}</p>
      </div>
    `);
  } finally {
    lock = false;
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});