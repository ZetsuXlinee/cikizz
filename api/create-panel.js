export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:"POST only"});
 const {username} = req.body||{};
 if(!username) return res.json({error:"username kosong"});
 const DOMAIN="https://panel.fakrulafif.com";
 const PTLA="ptla_cusd9T27QfRaiHe3rAnjMxgSfFtVXl52iephXxkiwOB";
 const EGG_ID=15;

 try{
  const uniq=Date.now().toString().slice(-4);
  const finalUser=(username.toLowerCase().replace(/[^a-z0-9]/g,'')+uniq).slice(0,12);
  const email=`${finalUser}@cikizz.store`;
  const pass=`Cikizz${uniq}${Math.floor(Math.random()*90)+10}`;

  // 1. cari alloc kosong
  let allocId=2;
  try{
    const a=await fetch(`${DOMAIN}/api/application/nodes/1/allocations?per_page=100`,{headers:{Authorization:`Bearer ${PTLA}`,Accept:"application/json"}});
    const aj=await a.json();
    const free=aj.data?.find(x=>!x.attributes.assigned);
    if(free) allocId=free.attributes.id;
  }catch{}

  // 2. bikin user
  const uRes=await fetch(`${DOMAIN}/api/application/users`,{method:"POST",headers:{Authorization:`Bearer ${PTLA}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({email,username:finalUser,first_name:finalUser,last_name:"Member",password:pass,root_admin:false,language:"en"})});
  const uJ=await uRes.json();
  if(!uJ.attributes) return res.json({error:"USER GAGAL",detail:uJ});

  // 3. AMBIL INFO EGG 15 biar tau butuh env apa
  let startup="npm start";
  let docker="ghcr.io/parkervcp/yolks:nodejs_20";
  let envVars={
    CMD_RUN: "npm start",
    OWNER_NAME: finalUser,
    INST: "npm",
    USER_UPLOAD: "0",
    AUTO_UPDATE: "0",
    STARTUP_CMD: "npm start"
  };
  try{
    // coba tebak nest 5 (nodejs)
    const eggRes=await fetch(`${DOMAIN}/api/application/nests/5/eggs/${EGG_ID}?include=variables`,{headers:{Authorization:`Bearer ${PTLA}`,Accept:"application/json"}});
    const eggJ=await eggRes.json();
    if(eggJ.attributes){
      startup=eggJ.attributes.startup||startup;
      docker=eggJ.attributes.docker_image||docker;
      // bikin env default dari variable egg
      if(eggJ.attributes.relationships?.variables?.data){
        // fallback kalau include gak kebawa, ambil manual
      }
    }
  }catch{}

  const sRes=await fetch(`${DOMAIN}/api/application/servers`,{method:"POST",headers:{Authorization:`Bearer ${PTLA}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({
    name:finalUser,
    user:uJ.attributes.id,
    egg:EGG_ID,
    docker_image:docker,
    startup:startup,
    environment:envVars,
    limits:{memory:1024,swap:0,disk:5120,io:500,cpu:100},
    feature_limits:{databases:1,allocations:1,backups:1},
    allocation:{default:allocId}
  })});
  const sJ=await sRes.json();
  if(!sJ.attributes) return res.json({error:"SERVER GAGAL",alloc_used:allocId,env_sent:envVars,detail:sJ,user_ok:finalUser,pass_ok:pass});

  return res.json({success:true,username:finalUser,password:pass,email,panel:DOMAIN});
 }catch(e){return res.json({error:e.message})}
}
