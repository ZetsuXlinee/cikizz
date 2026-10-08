export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:"Method salah"});
  const { username } = req.body;
  if(!username) return res.json({error:"Username kosong"});

  const DOMAIN = "https://panel.fakrulafif.com";
  const PTLA = "ptla_cusd9T27QfRaiHe3rAnjMxgSfFtVXl52iephXxkiwOB";
  const EGG_ID = 15;
  const LOC_ID = 1;

  try {
    const userRes = await fetch(`${DOMAIN}/api/application/users`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email: `${username.toLowerCase()}${Date.now()}@cikizz.store`,
        username: username.toLowerCase(),
        first_name: username,
        last_name: "Member",
        password: `cikizz${Math.floor(Math.random()*9000)+1000}`,
        root_admin: false,
        language: "en"
      })
    });
    const userData = await userRes.json();
    if(userData.errors) return res.json({error: JSON.stringify(userData.errors).slice(0,300)});
    
    const userId = userData.attributes.id;
    const pass = `cikizz${Math.floor(Math.random()*9000)+1000}`;

    const serverRes = await fetch(`${DOMAIN}/api/application/servers`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: `${username}-${Date.now()}`.slice(0,20),
        user: userId,
        egg: EGG_ID,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: "npm start",
        environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", STARTUP_CMD: "npm start" },
        limits: { memory: 1024, swap: 0, disk: 5120, io: 500, cpu: 100 },
        feature_limits: { databases: 1, allocations: 1, backups: 1 },
        allocation: { default: LOC_ID },
        deploy: { locations: [LOC_ID], dedicated_ip: false, port_range: [] }
      })
    });
    const serverData = await serverRes.json();
    if(serverData.errors) return res.json({error: "User jadi tapi server gagal: "+JSON.stringify(serverData.errors).slice(0,300)});

    return res.json({ success: true, username: username.toLowerCase(), password: pass, message: "BERHASIL MEMBER!" });
  } catch(e){
    return res.json({error: e.message});
  }
}
