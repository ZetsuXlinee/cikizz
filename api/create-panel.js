export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:"Method salah"});
  let { username } = req.body;
  if(!username) return res.json({error:"Username kosong"});

  const DOMAIN = "https://panel.fakrulafif.com";
  const PTLA = "ptla_cusd9T27QfRaiHe3rAnjMxgSfFtVXl52iephXxkiwOB";
  const EGG_ID = 15;

  try {
    const uniq = Date.now().toString().slice(-4);
    const finalUser = (username.toLowerCase().replace(/[^a-z0-9]/g,'') + uniq).slice(0,15);
    const email = `${finalUser}@cikizz.store`;
    const pass = `cikizz${uniq}${Math.floor(Math.random()*99)}`;

    // CARI ALOKASI KOSONG OTOMATIS
    let allocId = 1;
    try {
      const nodeCheck = await fetch(`${DOMAIN}/api/application/nodes/1/allocations?per_page=100`, {
        headers: { "Authorization": `Bearer ${PTLA}`, "Accept": "application/json" }
      });
      const nodeJson = await nodeCheck.json();
      if(nodeJson.data){
        const free = nodeJson.data.find(a => a.attributes.assigned === false);
        if(free) allocId = free.attributes.id;
      }
    } catch(e){}

    const userRes = await fetch(`${DOMAIN}/api/application/users`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${PTLA}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email, username: finalUser, first_name: finalUser, last_name: "Member", password: pass, root_admin: false, language: "en"
      })
    });
    const userData = await userRes.json();
    if(!userData.attributes) return res.json({error: "USER GAGAL", detail: userData});

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
        allocation: { default: allocId }
      })
    });
    const serverData = await serverRes.json();
    if(!serverData.attributes) return res.json({error: "SERVER GAGAL", alloc_used: allocId, detail: serverData, user_ok: finalUser, pass_ok: pass});

    return res.json({ success: true, username: finalUser, password: pass, panel: DOMAIN, alloc: allocId });
  } catch(e){ return res.json({error: e.message}) }
}
