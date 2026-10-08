const express = require('express');
const path = require('path');
const app = express();

const DOMAIN_PANEL = "https://panel.fakrulafif.com";
const PTLA = "ptla_cusd9T27QfRaiHe3rAnjMxgSfFtVXl52iephXxkiwOB";
const EGG_ID = 15;
const NEST_ID = 5;
const LOC_ID = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/create-panel', async (req, res) => {
  try {
    const { username } = req.body;
    if(!username) return res.json({error:"Username kosong"});
    const userRes = await fetch(`${DOMAIN_PANEL}/api/application/users`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email: `${username}@cikizz.store`,
        username: username.toLowerCase(),
        first_name: username,
        last_name: "Member",
        password: `cikizz${Math.floor(Math.random()*9999)}`,
        root_admin: false,
        language: "en"
      })
    });
    const userData = await userRes.json();
    if(userData.errors) return res.json({error: JSON.stringify(userData.errors)});
    const userId = userData.attributes.id;
    const serverRes = await fetch(`${DOMAIN_PANEL}/api/application/servers`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: username, user: userId, egg: EGG_ID,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: "npm start", environment: {},
        limits: { memory: 0, swap: 0, disk: 0, io: 500, cpu: 0 },
        feature_limits: { databases: 0, allocations: 0, backups: 0 },
        allocation: { default: LOC_ID }
      })
    });
    res.json({ success: true, message: "BERHASIL MEMBER!" });
  } catch(e){ res.json({error: e.message}) }
});

module.exports = app;
