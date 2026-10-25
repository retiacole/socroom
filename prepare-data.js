'use strict';
// Build-time fixture preparation. Runtime remains a self-contained offline HTML.
const crypto = require('node:crypto');
const SOURCE = { '認証':'認証監査', '監査':'監査', 'OS監査':'監査', 'ファイル監査':'監査', '運用':'収集基盤' };
const iso = time => '2026-10-20T'+time+'Z';
const xml = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function fields(raw) {
  const result={};
  for(const m of raw.matchAll(/([A-Za-z_][\w.-]*)=("[^"]*"|'[^']*'|\S+)/g)) result[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2');
  return result;
}
function formatLog(log) {
  const f=fields(log.raw), time=iso(log.time), originalSource=log.source;
  log.source=SOURCE[log.source]||log.source;
  // Normalized identity fields reflect only information this source observed.
  log.user=f.user||f.account||f.actor||f.upn||f.username||'';
  log.ip=[f.src,f.client_ip,f.remote,f.ip,f.dst].find(x=>x&&/^\d+\.\d+\.\d+\.\d+$/.test(x))|| (log.raw.includes(log.ip)&&log.ip?log.ip:'');
  if(['IdP','SaaS','メール','収集基盤','Proxy','Flow','DNS','Web','WAF'].includes(originalSource)) {
    // Cloud/service exports may identify a device ID, but that is not a
    // confirmed endpoint hostname. Keep it in the source properties instead.
    log.host='';
    if(['収集基盤','Proxy','Flow','DNS','Web','WAF'].includes(originalSource)) log.user=f.user||'';
  }
  if(['local_user_create','local_group_add'].includes(f.operation)) {
    const creation=f.operation==='local_user_create',id=creation?4720:4732;
    const data=creation?{SubjectUserName:f.actor,SubjectLogonId:f.session_id,TargetUserName:f.target_user,TargetDomainName:f.host,TargetSid:f.target_sid}:{SubjectUserName:f.actor,SubjectLogonId:f.session_id,MemberName:f.host+'\\'+f.target_user,MemberSid:f.target_sid,TargetUserName:f.group,TargetDomainName:'Builtin'};
    // Logon IDs use a hexadecimal synthetic Windows LUID shared by both events.
    data.SubjectLogonId='0x'+Buffer.from(String(f.session_id||'0')).toString('hex');
    log.event=`Security ${id}: ${creation?'A user account was created':'A member was added to a security-enabled local group'}`;
    log.raw=`<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"><System><Provider Name="Microsoft-Windows-Security-Auditing"/><EventID>${id}</EventID><TimeCreated SystemTime="${time}"/><Computer>${xml(f.host)}</Computer></System><EventData>${Object.entries(data).filter(([,v])=>v!==undefined).map(([k,v])=>`<Data Name="${k}">${xml(v)}</Data>`).join('')}</EventData></Event>`;
    log.path='/var/log/windows/security.xml';log.format='Windows Security XML（合成）';return;
  }
  if(originalSource==='IdP') {
    const properties={...f};delete properties.host;delete properties.user;delete properties.account;
    log.raw=JSON.stringify({time,category:'AuditLogs',operationName:log.event,...(log.user?{userPrincipalName:log.user}:{}),...(log.ip?{ipAddress:log.ip}:{}),properties});
    log.path='/var/log/identity/entra-audit.jsonl';log.format='Entra監査JSON（合成）';return;
  }
  if(originalSource==='メール'||originalSource==='SaaS') {
    const props={...f};delete props.host;delete props.user;
    log.raw=JSON.stringify({CreationTime:time,Operation:f.operation||f.action||log.event,...(log.user?{UserId:log.user}:{}),...(log.ip?{ClientIP:log.ip}:{}),Parameters:Object.entries(props).map(([Name,Value])=>({Name,Value}))});
    log.path='/var/log/saas/unified-audit.jsonl';log.format='M365監査JSON（合成）';return;
  }
  const properties={...f};
  if(!log.host)delete properties.host;
  if(!log.user)delete properties.user;
  log.raw=JSON.stringify({timestamp:time,event:log.event,...(log.host?{hostname:log.host}:{}),properties});
  // Do not present database/service authentication as a Linux sshd auth.log.
  log.path='/var/log/socroom/'+(log.source==='認証監査'?'authentication':({'ジョブ':'jobs','監査':'audit','収集基盤':'collector','Proxy':'proxy','Flow':'flow','DNS':'dns','Web':'web','WAF':'waf','EDR':'edr','MDM':'mdm','DLP':'dlp','端末管理':'device-management','配布管理':'deployment','アプリ':'application'}[log.source]||'events'))+'.jsonl';
  log.format='SOCroom JSON（合成）';
}
function timeAt(seconds) {const n=((seconds%86400)+86400)%86400;return [Math.floor(n/3600),Math.floor(n/60)%60,n%60].map(x=>String(x).padStart(2,'0')).join(':');}
function seconds(time){return time.split(':').reduce((sum,n)=>sum*60+Number(n),0);}
function background(c,count,assets) {
  const base=Math.min(...c.logs.map(l=>seconds(l.time))),salt=crypto.createHash('sha256').update(c.id).digest('hex').slice(0,6);
  const peers=[`office-${salt}-01`,`office-${salt}-02`];
  for(const name of peers)assets.push({name,owner:'業務端末管理担当',importance:'low',description:'一般業務用端末。資産台帳に登録された利用者の定期チェック・業務通信を収集。'});
  c.backgroundHosts=peers;
  const sourceLogs=c.logs.slice();
  for(let i=0;i<count;i++){
    // Baseline observations on the investigated host precede the incident
    // window: never invent heartbeats after a device loss or audit outage.
    // Other assets continue normal activity throughout the investigation.
    const primary=i%3===0&&i%5>=2;
    const time=timeAt(base-300+Math.floor(i*(primary?240:600)/count)),host=primary?c.host:peers[i%2],user=primary&&c.user?c.user:['s.aoki','m.tanaka','h.ito'][i%3];
    const ip='10.24.'+(80+i%5)+'.'+(20+i%40),id='evt-'+crypto.createHash('sha256').update(c.id+':'+i).digest('hex').slice(0,12);
    const item={id,time,offset:0,host,user,ip,source:'EDR',event:'device.heartbeat',raw:'',path:'',background:true};
    if(i%5===0){
      item.source='SSH';item.event='sshd: Accepted publickey';item.format='OpenSSH syslog（合成）';item.path='/var/log/auth.log';
      item.raw=`Oct 20 ${time} ${host} sshd[${2100+i}]: Accepted publickey for ${user} from ${ip} port ${41000+i} ssh2: ED25519 SHA256:${crypto.createHash('sha256').update(id).digest('base64').replace(/=+$/,'')}`;
    }else if(i%5===1){
      item.source='Web';item.event='HTTP access';item.host='';item.user='';item.format='nginx combined（合成）';item.path='/var/log/nginx/access.log';
      item.raw=`${ip} - - [20/Oct/2026:${time} +0000] "GET /${['assets/app.css','health','favicon.ico','dashboard'][i%4]} HTTP/1.1" 200 ${512+i} "https://portal.example.test/" "Mozilla/5.0"`;
    }else{
      const original=sourceLogs[i%sourceLogs.length],source=original.source;
      item.source=['SSH','Web'].includes(source)?'EDR':source;
      const event={'IdP':'sign-in.success','SaaS':'FileAccessed','メール':'MailItemsAccessed','収集基盤':'collector.batch.received','Proxy':'proxy.request.allowed','Flow':'flow.closed','DNS':'dns.response','ジョブ':'job.completed','監査':'file.read','認証監査':'session.authenticated','MDM':'device.check-in','配布管理':'deployment.inventory','端末管理':'device.inventory'}[item.source]||'device.heartbeat';
      item.event=event;item.raw=`${iso(time)} host=${host} user=${user} src=${ip} operation=${event} resource=business-home status=success bytes=${1024+i} record=${id}`;
      formatLog(item);
    }
    c.logs.push(item);
  }
}
module.exports=function prepare(cases,assets){
  for(const c of cases){
    if(c.contact?.questions?.length > 1){
      const shift=crypto.createHash('sha256').update(c.id).digest()[0]%c.contact.questions.length;
      c.contact.questions=[...c.contact.questions.slice(shift),...c.contact.questions.slice(0,shift)];
    }
    c.source=SOURCE[c.source]||c.source;
    for(const l of c.logs)formatLog(l);
    // A tiny tutorial remains focused on operating the UI. Normal shifts require filtering.
    const count=c.scenarioId==='tutorial'?0:c.bridge?(c.bridge.stage==='guided'?0:c.bridge.stage==='checklist'?50:75):({low:50,medium:100,high:180}[c.difficulty]);
    if(count)background(c,count,assets);
  }
};
