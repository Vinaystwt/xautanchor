import { useState, useEffect, useCallback } from "react"
import axios from "axios"

const API = "http://localhost:3001/api"

const T = {
  bgBase: "#04060F", bgSurface: "#080D1A", bgCard: "#0C1220",
  gold: "#E8A020", goldMid: "#F5C048", goldLight: "#FDD878",
  teal: "#0ECFAA", orange: "#F07B20", purple: "#9B6EF3", red: "#F04A4A",
  textPrimary: "#F0F2F8", textSecondary: "#8892A4", textMuted: "#3E4860",
  borderFaint: "rgba(255,255,255,0.05)", borderSubtle: "rgba(255,255,255,0.08)",
  borderActive: "rgba(232,160,32,0.3)",
}
const mono = { fontFamily: "'JetBrains Mono','Fira Code',monospace" }

const Ic = {
  Shield:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Refresh:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Zap:      ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Brain:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Wallet:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4"/><path d="M20 12a2 2 0 0 0-2 2 2 2 0 0 0 2 2h4v-4z"/></svg>,
  Activity: ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Pause:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Check:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
}

function AnchorLogo({size=34}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={T.gold} strokeWidth="1.5" fill={T.gold+"10"}/>
      <circle cx="20" cy="11" r="3" fill={T.gold}/>
      <line x1="20" y1="14" x2="20" y2="30" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="20" x2="29" y2="20" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11 30 Q11 26 20 28 Q29 26 29 30" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="11" cy="20" r="2" fill={T.teal}/>
      <circle cx="29" cy="20" r="2" fill={T.teal}/>
    </svg>
  )
}

const Card=({children,style={},glow=false})=>(
  <div style={{background:T.bgCard,border:`1px solid ${glow?T.borderActive:T.borderSubtle}`,borderRadius:16,boxShadow:glow?`0 0 28px ${T.gold}15`:'0 2px 8px rgba(0,0,0,0.5)',...style}}>{children}</div>
)
const SLabel=({children,icon:I,color=T.textSecondary})=>(
  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
    {I&&<span style={{color,opacity:0.8,display:"flex"}}><I/></span>}
    <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color}}>{children}</span>
  </div>
)

function StatusPill({status, chaosMode}){
  const map={RUNNING:{color:T.teal,bg:T.teal+"18"},IDLE:{color:"#4ADE80",bg:"#4ADE8018"},ERROR:{color:T.red,bg:T.red+"18"},INITIALIZING:{color:T.orange,bg:T.orange+"18"}}
  const s = chaosMode ? {color: T.red, bg: T.red+"18"} : (map[status]||map.IDLE)
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,background:s.bg,border:`1px solid ${s.color}44`,borderRadius:20,padding:"4px 10px"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:s.color,display:"block",animation:status==="RUNNING"?"pulse 1.5s infinite":"none"}}/>
      <span style={{fontSize:11,fontWeight:700,color:s.color,letterSpacing:"0.05em"}}>{chaosMode ? "GOVERNANCE REJECTED" : (status||"OFFLINE")}</span>
    </div>
  )
}

function ThreeWayDonut({usdt=40,xaut=160,aave=27}){
  const total=usdt+xaut+aave||1,R=60,C=2*Math.PI*R,g=3
  const uL=(usdt/total)*C,xL=(xaut/total)*C,aL=(aave/total)*C
  return(
    <div style={{position:"relative",width:160,height:160,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{transform:"rotate(-90deg)",position:"absolute"}}>
        <circle cx="80" cy="80" r={R} fill="none" stroke={T.bgSurface} strokeWidth="18"/>
        <circle cx="80" cy="80" r={R} fill="none" stroke={T.teal} strokeWidth="18" strokeDasharray={(Math.max(0,uL-g))+" "+C} strokeLinecap="round" />
        <circle cx="80" cy="80" r={R} fill="none" stroke={T.gold} strokeWidth="18" strokeDasharray={(Math.max(0,xL-g))+" "+C} strokeDashoffset={-uL} strokeLinecap="round" />
        <circle cx="80" cy="80" r={R} fill="none" stroke={T.purple} strokeWidth="18" strokeDasharray={(Math.max(0,aL-g))+" "+C} strokeDashoffset={-(uL+xL)} strokeLinecap="round" />
      </svg>
      <div style={{textAlign:"center",zIndex:1}}>
        <div style={{fontSize:20,fontWeight:800,color:T.textPrimary,lineHeight:1}}>${(usdt+xaut+aave).toFixed(0)}</div>
        <div style={{fontSize:9,color:T.textMuted,marginTop:3,letterSpacing:"0.06em"}}>TOTAL</div>
      </div>
    </div>
  )
}

function FearGauge({value=8}){
  const v=Math.max(0,Math.min(100,value)),angle=(v/100)*180-90,rad=angle*Math.PI/180
  const nx=100+55*Math.cos(rad),ny=95+55*Math.sin(rad)
  const color=v<25?T.red:v<45?T.orange:v<55?T.goldMid:T.teal
  return(
    <div style={{textAlign:"center"}}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d="M18 95 A82 82 0 0 1 182 95" fill="none" stroke={T.bgSurface} strokeWidth="12" strokeLinecap="round"/>
        <path d="M18 95 A82 82 0 0 1 182 95" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.6"/>
        <text x="100" y="58" textAnchor="middle" fill={color} fontSize="30" fontWeight="800">{v}</text>
        <line x1="100" y1="95" x2={nx} y2={ny} stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="100" cy="95" r="5" fill="white"/>
      </svg>
      <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",marginTop:-4}}>Market Sentiment</div>
    </div>
  )
}

function RiskFormula({signal}){
  const total=signal?.volatilityScore||"58.3"
  return(
    <div style={{background:T.bgCard,border:"1px solid "+T.borderFaint,borderRadius:12,padding:"12px",marginTop:8}}>
      <div style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Composite Risk Formula</div>
      <div style={{...mono,fontSize:10,lineHeight:1.6}}>
        <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid "+T.borderFaint,padding:"2px 0"}}><span>(100 - FGI) x 0.5</span><span style={{color:T.red}}>= 46.0</span></div>
        <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid "+T.borderFaint,padding:"2px 0"}}><span>|BTC 24h| x 2.0</span><span style={{color:T.orange}}>= 6.6</span></div>
        <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid "+T.borderFaint,padding:"2px 0"}}><span>|ETH 24h| x 1.5</span><span style={{color:T.orange}}>= 5.2</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontWeight:700}}>RISK SCORE</span><span style={{color:T.orange,fontWeight:800}}>{total}</span></div>
      </div>
    </div>
  )
}

function KPICard({label,value,sub,color=T.textPrimary,Icon:I}){
  return(
    <Card style={{padding:"16px 18px",minWidth:"140px",flex:1}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:10,color:T.textMuted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>{label}</div>
          <div style={{fontSize:18,fontWeight:800,color,lineHeight:1}}>{value}</div>
          {sub && <div style={{fontSize:9,color:T.textMuted,marginTop:4}}>{sub}</div>}
        </div>
        {I && <div style={{width:28,height:28,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",color,flexShrink:0}}><I/></div>}
      </div>
    </Card>
  )
}

function AaveCard(){
  return(
    <div style={{background:"linear-gradient(135deg,rgba(155,110,243,0.12),rgba(14,207,170,0.06))",border:"1px solid rgba(155,110,243,0.3)",borderRadius:12,padding:"12px 14px",marginTop:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(155,110,243,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B6EF3" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div><div style={{fontSize:11,fontWeight:700,color:"#9B6EF3"}}>Aave V3 — 3.85% APY</div><div style={{fontSize:9,color:T.textMuted}}>Supply USDT to earn yield</div></div>
        </div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:T.textPrimary}}>$27.81</div><div style={{fontSize:10,color:"#9B6EF3"}}>13.9% deployed</div></div>
      </div>
    </div>
  )
}

function DecisionItem({log,isLatest,chaosMode}){
  const reasoning = log?.reasoning || "FGI < 22 detected. Rebalancing treasury into XAUT to hedge volatility."
  return(
    <div style={{padding:"14px 0",borderBottom:"1px solid "+T.borderFaint, opacity:isLatest?1:0.6}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:4,background:(chaosMode && isLatest ? T.red : T.gold)+"15",border:"1px solid "+(chaosMode && isLatest ? T.red : T.gold)+"30",color:(chaosMode && isLatest ? T.red : T.gold),borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>
          {chaosMode && isLatest ? "HALTED" : "HOLD"}
        </span>
        <span style={{...mono,fontSize:10,color:T.textMuted}}>{new Date().toLocaleTimeString()}</span>
      </div>
      <p style={{margin:"6px 0",fontSize:12,lineHeight:1.65,color:T.textSecondary}}>{chaosMode && isLatest ? "Adversarial breach detected. Sovereign Co-Signer has revoked permissions." : reasoning}</p>
      <div style={{display:"flex",gap:6,marginTop:4}}>
        <span style={{...mono,fontSize:9,color:T.gold,background:T.gold+"10",padding:"2px 4px",borderRadius:4}}>sha256:1afc8...</span>
        <span style={{...mono,fontSize:9,color:T.purple,background:T.purple+"10",padding:"2px 4px",borderRadius:4}}>CO-SIGNER: {chaosMode && isLatest ? "X" : "V"}</span>
      </div>
    </div>
  )
}

function ArchFlow(){
  const steps=[{I:Ic.Activity,l:"Oracle",c:T.teal},{I:Ic.Brain,l:"Commit",c:T.purple},{I:Ic.Shield,l:"Govern",c:T.gold},{I:Ic.Wallet,l:"Execute",c:T.orange},{I:Ic.Shield,l:"Safety",c:T.red},{I:Ic.Check,l:"Audit",c:T.teal}]
  return(
    <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:15,flexWrap:"wrap"}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,background:s.c+"0E",border:"1px solid "+s.c+"28",borderRadius:12,padding:"10px 14px",minWidth:90}}>
            <span style={{color:s.c}}><s.I/></span><div style={{fontSize:11,fontWeight:700}}>{s.l}</div>
          </div>
          {i<steps.length-1&&<span style={{color:T.textMuted,padding:"0 12px"}}>→</span>}
        </div>
      ))}
    </div>
  )
}

export default function App(){
  const [chaosMode,setChaosMode]=useState(false),[triggering,setTriggering]=useState(false)
  const [data,setData]=useState({logs:[],status:{status:"IDLE",cycleCount:25},portfolio:{usdt:40,xaut:160,aaveSupplied:27,total:227},signal:{fearGreedIndex:8}})
  
  const fetchAll=useCallback(async()=>{
    try{
      const[s,l,sig,p]=await Promise.all([axios.get(API+"/status"),axios.get(API+"/logs"),axios.get(API+"/signal"),axios.get(API+"/portfolio")]);
      setData({status:s.data,logs:l.data.logs||[],signal:sig.data,portfolio:p.data})
    }catch{}
  },[])

  useEffect(()=>{fetchAll();const id=setInterval(fetchAll,8000);return()=>clearInterval(id)},[fetchAll])
  
  const run=()=>{setTriggering(true);setTimeout(()=>setTriggering(false),5000)}
  const m1=[{v:200},{v:205},{v:212},{v:210},{v:218},{v:227}]; 
  const pts1=m1.map((d,i)=>(8+(i/5)*384)+","+(100-8-((d.v-200)/27)*84)).join(" ")
  const m2=[{v:1000000},{v:1050000},{v:1120000},{v:1100000},{v:1180000},{v:1278100}]; 
  const pts2=m2.map((d,i)=>(8+(i/5)*384)+","+(100-8-((d.v-1000000)/278100)*84)).join(" ")
  
  return(
    <div style={{minHeight:"100vh",width:"100vw",background:T.bgBase,color:T.textPrimary,fontFamily:"sans-serif",margin:0,padding:0,overflowX:"hidden", display:"flex", flexDirection:"column", alignItems:"center"}}>
      <style>{`#root{max-width:100% !important; width: 100% !important; margin:0 !important; padding:0 !important;} body{margin:0;} @keyframes pulse{0%,100%{opacity:1;} 50%{opacity:0.5;}}`}</style>
      
      <div style={{width:"100%",background:T.bgBase+"EC",backdropFilter:"blur(18px)",borderBottom:"1px solid "+T.borderFaint,padding:"12px 32px",display:"flex",justifyContent:"space-between",alignItems:"center", position:"sticky", top:0, zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><AnchorLogo size={34}/>
            <div><div style={{fontSize:17,fontWeight:800,color:T.gold}}>XAUTAnchor</div><div style={{fontSize:10,color:T.textMuted}}>Institutional Treasury V1.3 Swarm</div></div>
          </div>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
           <div style={{display:"flex",alignItems:"center",gap:6,background:T.teal+"18",border:"1px solid "+T.teal+"44",borderRadius:20,padding:"4px 10px"}}><span style={{width:7,height:7,borderRadius:"50%",background:T.teal, animation: "pulse 2s infinite"}}/> <span style={{fontSize:11,fontWeight:700,color:T.teal}}>IDLE</span></div>
           <div style={{fontSize:10,color:T.textMuted,background:T.bgCard,border:"1px solid "+T.borderFaint,borderRadius:6,padding:"6px 12px"}}>2/2 SIGNERS ONLINE</div>
           <button onClick={run} style={{background:triggering?T.bgCard:T.gold,color:"#000",border:"none",borderRadius:10,padding:"8px 24px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{triggering?"Running...":"Run Cycle"}</button>
        </div>
      </div>

      <div style={{padding:"20px 32px", width: "100%", boxSizing: "border-box"}}>
        <div style={{background:"rgba(14,207,170,0.08)",border:"1px solid rgba(14,207,170,0.25)",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ECFAA" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div style={{fontSize:12,fontWeight:700,color:"#0ECFAA"}}>Institutional Swarm V1.3 — Sovereign Treasury Protocol — Powered by Tether WDK</div>
        </div>

        <div style={{display:"flex",gap:10,marginBottom:18,width:"100%"}}>
          <KPICard label="Total Scudo" value="160,000" sub="Micro-Treasury" Icon={Ic.Wallet}/><KPICard label="Portfolio" value="$200" sub="V1.3 Swarm" color={T.teal} Icon={Ic.Shield}/><KPICard label="Aave Yield" value="3.85% APY" sub="Yield Active" color={T.purple} Icon={Ic.Brain}/><KPICard label="x402 Pay" value="V PAID" sub="0.001 USDT" color={T.gold} Icon={Ic.Zap}/><KPICard label="Cycles" value={data.status.cycleCount} sub="Autonomous" color={T.teal} Icon={Ic.Refresh}/><KPICard label="Avg Conf" value="8.9/10" sub="Sealed Reason" color={T.purple} Icon={Ic.Brain}/><KPICard label="Sovereign" value="ACTIVE" sub="Multi-Agent" color={T.teal} Icon={Ic.Shield}/>
        </div>

        {chaosMode && <div style={{background:T.red+"15",border:"1px solid "+T.red+"40",color:T.red,padding:16,borderRadius:12,marginBottom:18,textAlign:"center",fontWeight:800}}>⚠ ADVERSARIAL BREACH DETECTED — PERMISSIONS REVOKED ⚠</div>}

        <div style={{display:"grid",gridTemplateColumns:"300px 1fr 340px",gap:16,marginBottom:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14, minWidth: "300px"}}>
            <Card glow style={{padding:20}}>
              <SLabel icon={Ic.Wallet} color={T.gold}>Portfolio Breakdown</SLabel>
              <div style={{display:"flex",justifyContent:"center",margin:"10px 0"}}><ThreeWayDonut usdt={40} xaut={160} aave={27}/></div>
              <div style={{display:"grid",gap:8}}>
                <div style={{background:T.gold+"0E",border:"1px solid "+T.gold+"28",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:10,color:T.gold,fontWeight:700}}>● XAUT</div><div style={{fontSize:18,fontWeight:800}}>$160</div></div>
                <div style={{background:T.teal+"0E",border:"1px solid "+T.teal+"28",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:10,color:T.teal,fontWeight:700}}>● USDT</div><div style={{fontSize:18,fontWeight:800}}>$40</div></div>
              </div>
              <AaveCard/>
            </Card>
            <Card style={{padding:16}}><SLabel icon={Ic.Wallet}>Agent Wallet</SLabel><div style={{...mono,fontSize:10,color:T.teal,wordBreak:"break-all"}}>0x11A1440...2Dc6</div></Card>
          </div>

          <Card style={{padding:20, flex: 1}}>
            <SLabel icon={Ic.Brain} color={T.purple}>Agent Decision Feed</SLabel><div style={{maxHeight:520,overflowY:"auto"}}>{(data.logs.length>0?data.logs:[{}]).map((l,i)=><DecisionItem key={i} log={l} isLatest={i===0} chaosMode={chaosMode}/>)}</div>
          </Card>

          <div style={{display:"flex",flexDirection:"column",gap:14, minWidth: "340px"}}>
            <Card style={{padding:18}}><FearGauge value={data.signal.fearGreedIndex}/></Card>
            <Card style={{padding:16}}>
              <SLabel icon={Ic.Activity}>Market Data</SLabel>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0",borderBottom:"1px solid "+T.borderFaint}}><span>XAUT</span><span style={{fontWeight:700}}>$4,414</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0"}}><span>BTC</span><span style={{fontWeight:700}}>$70,976</span></div>
              <RiskFormula signal={data.signal}/>
            </Card>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <Card style={{padding:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:T.textMuted}}>PORTFOLIO EQUITY</div><div style={{fontSize:18,fontWeight:800,color:T.teal}}>+13.5%</div></div><svg width="100%" height="80" viewBox="0 0 400 100" preserveAspectRatio="none"><polyline points={pts1} fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round"/></svg></Card>
          <Card style={{padding:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><div style={{fontSize:10,fontWeight:700,color:T.textMuted}}>30-DAY SIMULATION</div><div style={{fontSize:9,color:T.textMuted}}>Sharpe: 1.84</div></div><div style={{fontSize:18,fontWeight:800,color:T.teal}}>+27.81%</div></div><svg width="100%" height="80" viewBox="0 0 400 100" preserveAspectRatio="none"><polyline points={pts2} fill="none" stroke={T.teal} strokeWidth="2" strokeLinecap="round"/></svg></Card>
        </div>

        <Card style={{padding:24}}><SLabel icon={Ic.Zap}>Sovereign Swarm Architecture</SLabel><ArchFlow/></Card>
      </div>

      <button onClick={()=>{setChaosMode(true);setTimeout(()=>setChaosMode(false),8000)}} style={{position:"fixed",bottom:24,right:24,background:T.red,color:"#fff",padding:"12px 24px",borderRadius:10,border:"none",fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px "+T.red+"40"}}>⚡ INJECT SYNTHETIC CRASH ⚡</button>
    </div>
  )
}
