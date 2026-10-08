export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:"Method salah"});
  
  let { username } = req.body;
  if(!username) return res.json({error:"Username kosong"});

  const DOMAIN = "https://panel.fakrulafif.com";
  const PTLA = "ptla_cusd9T27QfRaiHe3rAnjMxgSfFtVXl52iephXxkiwOB"; // Tempel full punya lu
  const EGG_ID = 15;
  const LOC_ID = 1;

  try {
    // BIKIN UNIK BIAR GAK DUPLIKAT
    const uniq = Date.now().toString().slice(-4);
    const finalUser = (username.toLowerCase().replace(/[^a-z0-9]/g,'') + uniq).slice(0,15);
    const email = `${finalUser}@cikizz.store`;
    const pass = `cikizz${uniq}${Math.floor(Math.random()*99)}`;

    const userRes = await fetch(`${DOMAIN}/api/application/users`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email, username: finalUser, first_name: finalUser, last_name: "Member", password: pass, root_admin: false, language: "en"
      })
    });
    const userData = await userRes.json();
    if(!userData.attributes) return res.json({error: "USER GAGAL: " + JSON.stringify(userData).slice(0,400)});

    const serverRes = await fetch(`${DOMAIN}/api/application/servers`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: finalUser,
        user: userData.attributes.id,
        egg: EGG_ID,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: "npm start",
        environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", STARTUP_CMD: "npm start" },
        limits: { memory: 1024, swap: 0, disk: 5120, io: 500, cpu: 100 },
        feature_limits: { databases: 1, allocations: 1, backups: 1 },
        allocation: { default: LOC_ID }
      })
    });
    const serverData = await serverRes.json();
    if(!serverData.attributes) return res.json({error: "SERVER GAGAL: " + JSON.stringify(serverData).slice(0,400), user_ok: finalUser, pass_ok: pass});

    return res.json({ success: true, username: finalUser, password: pass, message: "BERHASIL!" });
  } catch(e){ return res.json({error: e.message}) }
}
