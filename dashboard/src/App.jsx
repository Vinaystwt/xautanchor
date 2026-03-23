import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import AaveCard from './components/AaveCard'
import BacktestPanel from './components/BacktestPanel'
import EquityChart from './components/EquityChart'
import MainnetBadge from './components/MainnetBadge'
import ScaleNote from './components/ScaleNote'
import RiskFormula from './components/RiskFormula'

const API = 'http://localhost:3001/api'
const T = {
  bgBase:'#04060F',bgSurface:'#080D1A',bgCard:'#0C1220',
  gold:'#E8A020',goldMid:'#F5C048',goldLight:'#FDD878',
  teal:'#0ECFAA',orange:'#F07B20',purple:'#9B6EF3',red:'#F04A4A',
  textPrimary:'#F0F2F8',textSecondary:'#8892A4',textMuted:'#3E4860',
  borderFaint:'rgba(255,255,255,0.05)',borderSubtle:'rgba(255,255,255,0.08)',borderActive:'rgba(232,160,32,0.3)',
}
const mono={fontFamily:"'JetBrains Mono','Fira Code',monospace"}
const Ic={
  Shield:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Refresh:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Zap:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Brain:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Wallet:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4"/><path d="M20 12a2 2 0 0 0-2 2 2 2 0 0 0 2 2h4v-4z"/></svg>,
  Activity:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Pause:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Link:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Check:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowUp:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDn:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
}

function AnchorLogo({size=34}){return<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={T.gold} strokeWidth="1.5" fill={T.gold+'10'}/><circle cx="20" cy="11" r="3" fill={T.gold}/><line x1="20" y1="14" x2="20" y2="30" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round"/><line x1="11" y1="20" x2="29" y2="20" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round"/><path d="M11 30 Q11 26 20 28 Q29 26 29 30" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="11" cy="20" r="2" fill={T.teal}/><circle cx="29" cy="20" r="2" fill={T.teal}/></svg>}

const Card=({children,style={},glow=false})=>
    
    <div className='scudo-banner' style={{ background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)', border: '1px solid #fbbf24', color: '#fbbf24', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ height: '8px', width: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
            Tether Ecosystem Alignment: V1.3
        </span>
        <span>Treasury Accounting: SCUDO (1 XAU₮ = 1000 Scudo)</span>
    </div>
    
<div className='bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30 flex items-center gap-2'>
        <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
        Agent Active: {Math.floor((Date.now() - (window.startTime || Date.now())) / 3600000)}h {Math.floor(((Date.now() - (window.startTime || Date.now())) / 60000) % 60)}m
    </div>
    
<div style={{background:T.bgCard,border:`1px solid ${glow?T.borderActive:T.borderSubtle}`,borderRadius:16,boxShadow:glow?`0 0 28px ${T.gold}15`:'0 2px 8px rgba(0,0,0,0.5)',...style}}>{children}</div>
const SLabel=({children,icon:I,color=T.textSecondary})=><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>{I&&<span style={{color,opacity:0.8,display:'flex'}}><I/></span>}<span style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color}}>{children}</span></div>

function StatusPill({status}){
  const map={RUNNING:{color:T.teal,bg:T.teal+'18'},IDLE:{color:'#4ADE80',bg:'#4ADE8018'},ERROR:{color:T.red,bg:T.red+'18'},INITIALIZING:{color:T.orange,bg:T.orange+'18'}}
  const s=map[status]||map.IDLE
  return<div style={{display:'flex',alignItems:'center',gap:6,background:s.bg,border:`1px solid ${s.color}44`,borderRadius:20,padding:'4px 10px'}}><span style={{width:7,height:7,borderRadius:'50%',background:s.color,display:'block',animation:status==='RUNNING'?'pulse 1.5s infinite':'none'}}/><span style={{fontSize:11,fontWeight:700,color:s.color,letterSpacing:'0.05em'}}>{status||'OFFLINE'}</span></div>
}

function ThreeWayDonut({usdt,xaut,aave}){
  const total=usdt+xaut+aave||1,R=60,C=2*Math.PI*R,g=3
  const uL=(usdt/total)*C,xL=(xaut/total)*C,aL=(aave/total)*C
  return<div style={{position:'relative',width:160,height:160,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <svg width="160" height="160" viewBox="0 0 160 160" style={{transform:'rotate(-90deg)',position:'absolute'}}>
      <circle cx="80" cy="80" r={R} fill="none" stroke={T.bgSurface} strokeWidth="18"/>
      <circle cx="80" cy="80" r={R} fill="none" stroke={T.teal} strokeWidth="18" strokeDasharray={`${Math.max(0,uL-g)} ${C}`} strokeLinecap="round" style={{transition:'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)'}}/>
      <circle cx="80" cy="80" r={R} fill="none" stroke={T.gold} strokeWidth="18" strokeDasharray={`${Math.max(0,xL-g)} ${C}`} strokeDashoffset={-uL} strokeLinecap="round" style={{transition:'all 0.9s cubic-bezier(0.4,0,0.2,1)'}}/>
      <circle cx="80" cy="80" r={R} fill="none" stroke={T.purple} strokeWidth="18" strokeDasharray={`${Math.max(0,aL-g)} ${C}`} strokeDashoffset={-(uL+xL)} strokeLinecap="round" style={{transition:'all 0.9s cubic-bezier(0.4,0,0.2,1)'}}/>
    </svg>
    <div style={{textAlign:'center',zIndex:1}}>
      <div style={{fontSize:20,fontWeight:800,color:T.textPrimary,lineHeight:1}}>${(usdt+xaut+aave).toFixed(0)}</div>
      <div style={{fontSize:9,color:T.textMuted,marginTop:3,letterSpacing:'0.06em'}}>TOTAL</div>
    </div>
  </div>
}

// FIXED Fear Gauge — needle and number no longer overlap
function FearGauge({value=50}){
  const v=Math.max(0,Math.min(100,value))
  const angle=(v/100)*180-90
  const rad=angle*Math.PI/180
  // Shorter needle so it doesn't overlap the number
  const needleLen=55
  const nx=100+needleLen*Math.cos(rad)
  const ny=95+needleLen*Math.sin(rad)
  const color=v<25?T.red:v<45?T.orange:v<55?T.goldMid:v<75?'#90EE90':T.teal
  const label=v<25?'Extreme Fear':v<45?'Fear':v<55?'Neutral':v<75?'Greed':'Extreme Greed'
  return(
    <div style={{textAlign:'center'}}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={T.red}/>
            <stop offset="25%" stopColor={T.orange}/>
            <stop offset="50%" stopColor={T.goldMid}/>
            <stop offset="75%" stopColor="#90EE90"/>
            <stop offset="100%" stopColor={T.teal}/>
          </linearGradient>
        </defs>
        {/* Arc track */}
        <path d="M18 95 A82 82 0 0 1 182 95" fill="none" stroke={T.bgSurface} strokeWidth="12" strokeLinecap="round"/>
        <path d="M18 95 A82 82 0 0 1 182 95" fill="none" stroke="url(#gg)" strokeWidth="12" strokeLinecap="round" opacity="0.75"/>
        {/* Value — positioned ABOVE the arc center, well clear of needle */}
        <text x="100" y="58" textAnchor="middle" fill={color} fontSize="30" fontWeight="800">{v}</text>
        {/* Needle — starts from arc center point */}
        <line x1="100" y1="95" x2={nx} y2={ny} stroke="white" strokeWidth="2.5" strokeLinecap="round"
          style={{transition:'all 0.9s cubic-bezier(0.4,0,0.2,1)'}}/>
        <circle cx="100" cy="95" r="5" fill="white"/>
      </svg>
      <div style={{fontSize:11,fontWeight:700,color,letterSpacing:'0.08em',textTransform:'uppercase',marginTop:-4}}>{label}</div>
    </div>
  )
}

function Sparkline({data=[],color=T.gold,w=100,h=36}){
  if(data.length<2)return<div style={{width:w,height:h}}/>
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1,p=3
  const pts=data.map((v,i)=>`${p+(i/(data.length-1))*(w-p*2)},${h-p-((v-min)/range)*(h-p*2)}`).join(' ')
  const area=`${p},${h-p} ${pts} ${w-p},${h-p}`,id=`sg${color.replace('#','')}`
  return<svg width={w} height={h}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={area} fill={`url(#${id})`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function ActionTag({action}){
  const map={HEDGE:{color:T.gold,bg:T.gold+'14',label:'HEDGE',I:Ic.Shield},REBALANCE:{color:T.teal,bg:T.teal+'14',label:'REBALANCE',I:Ic.Refresh},HOLD:{color:T.textSecondary,bg:T.textSecondary+'12',label:'HOLD',I:Ic.Pause}}
  const c=map[action]||map.HOLD
  return<span style={{display:'inline-flex',alignItems:'center',gap:4,background:c.bg,border:`1px solid ${c.color}30`,color:c.color,borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:700,letterSpacing:'0.06em'}}><c.I/>{c.label}</span>
}

function KPICard({label,value,sub,color=T.textPrimary,Icon:I}){
  return<Card style={{padding:'16px 18px'}}><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}><div><div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6}}>{label}</div><div style={{fontSize:20,fontWeight:800,color,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{sub}</div>}</div>{I&&<div style={{width:34,height:34,borderRadius:8,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}><I/></div>}</div></Card>
}

function PriceRow({name,sym,price,change,color,spark}){
  const pos=parseFloat(change||0)>=0
  return<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${T.borderFaint}`}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:30,height:30,borderRadius:8,background:color+'18',border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><div style={{width:8,height:8,borderRadius:'50%',background:color}}/></div>
      <div><div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{sym}</div><div style={{fontSize:11,color:T.textMuted}}>{name}</div></div>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <Sparkline data={spark||[]} color={color} w={56} h={26}/>
      <div style={{textAlign:'right',minWidth:80}}>
        <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>${parseInt(price||0).toLocaleString()}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:3,fontSize:11,fontWeight:600,color:pos?T.teal:T.red}}>
          {pos?<Ic.ArrowUp/>:<Ic.ArrowDn/>}{pos?'+':''}{parseFloat(change||0).toFixed(2)}%
        </div>
      </div>
    </div>
  </div>
}

function DecisionItem({log,isLatest}){
  const isH=log.action==='HEDGE',isR=log.action==='REBALANCE',accent=isH?T.gold:isR?T.teal:T.textMuted
  const hasAave=log.aaveTxHash||log.aaveAction
  return<div style={{padding:'14px 0',borderBottom:`1px solid ${T.borderFaint}`,opacity:isLatest?1:0.65}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
        <ActionTag action={log.action}/>
        {isLatest&&<span style={{fontSize:10,color:T.teal,background:T.teal+'15',border:`1px solid ${T.teal}30`,borderRadius:4,padding:'1px 6px',fontWeight:700}}>LATEST</span>}
        {hasAave&&<span style={{fontSize:10,color:T.purple,background:T.purple+'15',border:`1px solid ${T.purple}30`,borderRadius:4,padding:'1px 6px',fontWeight:700}}>+AAVE</span>}
        {log.portfolio?.slippagePct&&<span style={{fontSize:10,color:T.orange,background:T.orange+'10',border:`1px solid ${T.orange}25`,borderRadius:4,padding:'1px 6px',fontWeight:600}}>slip {log.portfolio.slippagePct}%</span>}
      </div>
      <span style={{...mono,fontSize:10,color:T.textMuted}}>{log.timestamp?new Date(log.timestamp).toLocaleTimeString():''}</span>
    </div>
    <p style={{margin:'6px 0',fontSize:12.5,lineHeight:1.65,color:isLatest?'#C8D0E0':T.textSecondary}}>{log.reasoning}</p>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
      {log.marketSignal?.fearGreedIndex!==undefined&&<span style={{...mono,fontSize:10,color:T.textMuted,background:T.bgSurface,border:`1px solid ${T.borderFaint}`,borderRadius:4,padding:'2px 6px'}}>FGI {log.marketSignal.fearGreedIndex}/100</span>}
      {log.confidence&&<span style={{...mono,fontSize:10,color:T.purple,background:T.purple+'10',border:`1px solid ${T.purple}25`,borderRadius:4,padding:'2px 6px'}}>{log.confidence}/10 conf</span>}
      {log.portfolio?.swapAmount&&<span style={{...mono,fontSize:10,color:accent,background:accent+'10',border:`1px solid ${accent}25`,borderRadius:4,padding:'2px 6px'}}>${log.portfolio.swapAmount} swapped</span>}
      {log.txHash&&<a href={`https://amoy.polygonscan.com/tx/${log.txHash}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:3,...mono,fontSize:10,color:T.teal,background:T.teal+'10',border:`1px solid ${T.teal}25`,borderRadius:4,padding:'2px 6px'}}>TX<Ic.Link/></a>}
      {log.aaveTxHash&&<a href={`https://amoy.polygonscan.com/tx/${log.aaveTxHash}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:3,...mono,fontSize:10,color:T.purple,background:T.purple+'10',border:`1px solid ${T.purple}25`,borderRadius:4,padding:'2px 6px'}}>Aave TX<Ic.Link/></a>}
    </div>
    {log.aaveAction&&<div style={{marginTop:6,fontSize:10,color:T.purple,background:T.purple+'08',border:`1px solid ${T.purple}20`,borderRadius:6,padding:'4px 8px'}}>🏦 {log.aaveAction}</div>}
  </div>
}

function ArchFlow(){
  const steps=[
    {I:Ic.Activity,label:'Oracle',sub:'FGI+ATR\nBTC·ETH·XAU₮',color:T.teal},
    {I:Ic.Brain,label:'Reason',sub:'Groq LLM\nJSON+cooldown',color:T.purple},
    {I:Ic.Wallet,label:'WDK',sub:'Self-custodial\nPolygon',color:T.gold},
    {I:Ic.Refresh,label:'Swap',sub:'USDT↔XAU₮\nVelora EVM',color:T.orange},
    {I:Ic.Shield,label:'Aave V3',sub:'USDT yield\non HOLD',color:T.purple},
    {I:Ic.Check,label:'Log',sub:'Reasoning\n+TX hashes',color:T.teal},
  ]
  return<div style={{display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:0}}>
    {steps.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,background:s.color+'0E',border:`1px solid ${s.color}28`,borderRadius:12,padding:'10px 14px',minWidth:90,textAlign:'center'}}>
        <span style={{color:s.color,display:'flex'}}><s.I/></span>
        <div style={{fontSize:11,fontWeight:700,color:T.textPrimary}}>{s.label}</div>
        <div style={{fontSize:9,color:T.textMuted,whiteSpace:'pre-line',lineHeight:1.4}}>{s.sub}</div>
      </div>
      {i<steps.length-1&&<div style={{color:T.textMuted,fontSize:16,padding:'0 6px'}}>→</div>}
    </div>)}
  </div>
}

export default function App(){
  const [status,setStatus]=useState(null)
  const [logs,setLogs]=useState([])
  const [signal,setSignal]=useState(null)
  const [portfolio,setPortfolio]=useState(null)
  const [triggering,setTriggering]=useState(false)
  const [lastUpdate,setLastUpdate]=useState(null)
  const [spark,setSpark]=useState({btc:[],eth:[],gold:[]})

  const fetchAll=useCallback(async()=>{
    try{
      const[s,l,sig,p]=await Promise.all([axios.get(`${API}/status`),axios.get(`${API}/logs`),axios.get(`${API}/signal`),axios.get(`${API}/portfolio`)])
      setStatus(s.data);setLogs(l.data.logs);setSignal(sig.data);setPortfolio(p.data)
      setLastUpdate(new Date().toLocaleTimeString())
      if(sig.data)setSpark(prev=>({
        btc:[...prev.btc.slice(-19),parseFloat(sig.data.btcPrice||0)],
        eth:[...prev.eth.slice(-19),parseFloat(sig.data.ethPrice||0)],
        gold:[...prev.gold.slice(-19),parseFloat(sig.data.goldPrice||0)],
      }))
    }catch{}
  },[])

  useEffect(()=>{fetchAll();const id=setInterval(fetchAll,8000);return()=>clearInterval(id)},[fetchAll])

  const trigger=async()=>{
    setTriggering(true)
    try{await axios.post(`${API}/trigger`)}catch{}
    setTimeout(()=>{fetchAll();setTriggering(false)},7000)
  }

  const port=portfolio||{usdt:120,xaut:50,aaveSupplied:30,total:200,history:[]}
  const usdt=port.usdt||0,xaut=port.xaut||0,aave=port.aaveSupplied||0
  const total=usdt+xaut+aave
  const xautPct=total>0?((xaut/total)*100).toFixed(1):'0'
  const aavePct=total>0?((aave/total)*100).toFixed(1):'0'
  const aaveAPY=port.aaveAPY||3.85
  const hedgeN=logs.filter(l=>l.action==='HEDGE').length
  const rebalN=logs.filter(l=>l.action==='REBALANCE').length
  const aaveN=logs.filter(l=>l.aaveTxHash).length
  const avgConf=logs.length>0?(logs.reduce((s,l)=>s+(l.confidence||0),0)/logs.length).toFixed(1):'-'
  const fgi=signal?.fearGreedIndex??50
  const fgiColor=fgi<25?T.red:fgi<45?T.orange:fgi<55?T.goldMid:T.teal

  return(
    <div style={{
      minHeight:'100vh',
      width:'100vw',
      background:T.bgBase,
      color:T.textPrimary,
      fontFamily:"'Inter',-apple-system,sans-serif",
      fontSize:14,
      overflowX:'hidden',
      backgroundImage:`radial-gradient(ellipse 700px 400px at 10% 0%,${T.gold}08 0%,transparent 70%),radial-gradient(ellipse 600px 400px at 90% 100%,${T.teal}06 0%,transparent 70%)`
    }}>
      <style>{`
        html,body,#root{margin:0;padding:0;width:100%;overflow-x:hidden}
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${T.borderSubtle};border-radius:2px}
        a{text-decoration:none}
      `}</style>

      {/* TOPBAR — true full width */}
      <div style={{
        position:'sticky',top:0,zIndex:100,
        width:'100%',
        background:`${T.bgBase}EC`,backdropFilter:'blur(18px)',
        borderBottom:`1px solid ${T.borderFaint}`,
        padding:'12px 32px'
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <AnchorLogo size={34}/>
            <div>
              <div style={{fontSize:17,fontWeight:800,lineHeight:1,letterSpacing:'-0.02em',background:`linear-gradient(90deg,${T.goldLight},${T.gold},${T.teal})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>XAU₮Anchor</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>Autonomous Gold-Hedge DeFi Agent · Tether WDK + Aave V3</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <StatusPill status={status?.status}/>
            <div style={{display:'flex',alignItems:'center',gap:6,...mono,fontSize:11,color:T.textMuted,background:T.bgCard,border:`1px solid ${T.borderFaint}`,borderRadius:6,padding:'4px 10px'}}>
              <span style={{color:'#8247E5',fontSize:13}}>⬡</span> Polygon Amoy
            </div>
            {lastUpdate&&<div style={{fontSize:11,color:T.textMuted}}>Updated {lastUpdate}</div>}
          </div>
          <button onClick={trigger} disabled={triggering} style={{
            display:'flex',alignItems:'center',gap:7,
            background:triggering?T.bgCard:`linear-gradient(135deg,${T.gold},${T.orange})`,
            color:triggering?T.textMuted:'#0A0500',
            border:`1px solid ${triggering?T.borderSubtle:'transparent'}`,
            borderRadius:10,padding:'10px 20px',fontWeight:700,fontSize:13,
            cursor:triggering?'not-allowed':'pointer',minWidth:138,transition:'all 0.2s ease'
          }}>
            {triggering?<Ic.Activity/>:<Ic.Zap/>}
            {triggering?'Running...':'Run Cycle'}
          </button>
        </div>
      </div>

      {/* BODY — full width, consistent padding */}
      <div style={{width:'100%',padding:'20px 32px'}}>

        {/* Mainnet Badge */}
        <MainnetBadge/>
        <ScaleNote/>

        {/* KPI ROW */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:12,marginBottom:18}}>
          <KPICard label="Portfolio" value={`$${total.toFixed(0)}`} sub="3-asset treasury" Icon={Ic.Wallet}/>
          <KPICard label="Gold (XAU₮)" value={`${xautPct}%`} sub={`$${xaut.toFixed(0)}`} color={T.gold} Icon={Ic.Shield}/>
          <KPICard label="Aave Yield" value={`${aaveAPY}% APY`} sub={`$${aave.toFixed(0)} earning`} color={T.purple} Icon={Ic.Brain}/>
          <KPICard label="Cycles" value={status?.cycleCount||0} sub={`every ${status?.config?.pollIntervalMinutes||5} min`} color={T.teal} Icon={Ic.Refresh}/>
          <KPICard label="Hedge Actions" value={hedgeN} sub={`${rebalN} rebalances`} color={T.gold} Icon={Ic.ArrowDn}/>
          <KPICard label="Aave TXs" value={aaveN} sub="on-chain supply" color={T.purple} Icon={Ic.Activity}/>
          <KPICard label="Avg Confidence" value={`${avgConf}/10`} sub={`${logs.length} decisions`} color={T.purple} Icon={Ic.Brain}/>
        </div>

        {/* MAIN 3-COL GRID */}
        <div style={{display:'grid',gridTemplateColumns:'300px 1fr 340px',gap:16,marginBottom:16,alignItems:'start'}}>

          {/* COL A — Portfolio */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Card glow>
              <div style={{padding:'20px 20px 14px'}}>
                <SLabel icon={Ic.Wallet} color={T.gold}>Portfolio (3-Asset)</SLabel>
                <div style={{display:'flex',justifyContent:'center',margin:'4px 0 14px'}}>
                  <ThreeWayDonut usdt={usdt} xaut={xaut} aave={aave}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[{label:'USDT',color:T.teal,val:usdt},{label:'XAU₮',color:T.gold,val:xaut}].map(a=>(
                    <div key={a.label} style={{background:a.color+'0E',border:`1px solid ${a.color}28`,borderRadius:10,padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:10,color:a.color,fontWeight:700,letterSpacing:'0.06em',marginBottom:3}}>● {a.label}</div>
                      <div style={{fontSize:18,fontWeight:800,color:T.textPrimary}}>${a.val.toFixed(0)}</div>
                      <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{total>0?((a.val/total)*100).toFixed(0):0}%</div>
                    </div>
                  ))}
                </div>
                <AaveCard portfolio={port}/>
              </div>
              {(port.history?.length||0)>1&&(
                <div style={{padding:'10px 20px 16px',borderTop:`1px solid ${T.borderFaint}`}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Portfolio History</div>
                  <Sparkline data={port.history.map(h=>h.total||0)} color={T.gold} w={258} h={44}/>
                </div>
              )}
            </Card>
            <Card style={{padding:'14px 16px'}}>
              <SLabel icon={Ic.Wallet}>Agent Wallet</SLabel>
              <div style={{...mono,fontSize:11,color:T.teal,wordBreak:'break-all',lineHeight:1.6,background:T.teal+'08',border:`1px solid ${T.teal}20`,borderRadius:6,padding:10,marginBottom:10}}>
                {status?.walletAddress||'0x...'}
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div><div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>POL Balance</div><div style={{fontWeight:700,color:'#8247E5',fontSize:14}}>{port.nativeBalance||'0'} POL</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>Chain ID</div><div style={{...mono,fontWeight:700,color:'#8247E5',fontSize:13}}>80002</div></div>
              </div>
            </Card>
          </div>

          {/* COL B — Decision Feed */}
          <Card>
            <div style={{padding:'20px 20px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <SLabel icon={Ic.Brain} color={T.purple}>Agent Decision Feed</SLabel>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>{logs.length} logged</div>
            </div>
            <div style={{padding:'0 20px 20px',maxHeight:560,overflowY:'auto'}}>
              {logs.length===0?(
                <div style={{textAlign:'center',padding:'60px 0',color:T.textMuted,fontSize:13}}>Agent initializing...</div>
              ):logs.map((log,i)=><DecisionItem key={log.id||i} log={log} isLatest={i===0}/>)}
            </div>
          </Card>

          {/* COL C — Signals */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Card>
              <div style={{padding:'18px 18px 14px'}}>
                <SLabel icon={Ic.Activity}>Market Sentiment</SLabel>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <FearGauge value={fgi}/>
                </div>
                <div style={{display:'flex',marginTop:10,padding:'10px 14px',background:T.bgSurface,borderRadius:10}}>
                  {[
                    {label:'Risk',val:signal?.volatilityScore||'-',color:parseFloat(signal?.volatilityScore||50)>70?T.red:T.teal},
                    {label:'ATR',val:signal?.atrScore||'0',color:T.orange},
                    {label:'Hedge<',val:status?.config?.volatilityHighThreshold||30,color:T.red},
                    {label:'Rebal>',val:status?.config?.volatilityLowThreshold||60,color:T.teal},
                  ].map((item,i,arr)=>(
                    <div key={item.label} style={{flex:1,textAlign:'center',borderRight:i<arr.length-1?`1px solid ${T.borderFaint}`:'none'}}>
                      <div style={{fontSize:9,color:T.textMuted,marginBottom:2}}>{item.label}</div>
                      <div style={{fontSize:14,fontWeight:800,color:item.color}}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div style={{padding:'16px 16px 12px'}}>
                <SLabel icon={Ic.Activity}>Asset Prices</SLabel>
                <PriceRow name="Bitcoin" sym="BTC" price={signal?.btcPrice} change={signal?.btcChange24h} color="#F7931A" spark={spark.btc}/>
                <PriceRow name="Ethereum" sym="ETH" price={signal?.ethPrice} change={signal?.ethChange24h} color="#627EEA" spark={spark.eth}/>
                <PriceRow name="Tether Gold" sym="XAU₮" price={signal?.goldPrice} change={signal?.goldChange24h} color={T.gold} spark={spark.gold}/>
                <RiskFormula signal={signal}/>
              </div>
            </Card>

            {logs[0]&&(
              <Card glow>
                <div style={{padding:'14px 16px'}}>
                  <SLabel icon={Ic.Brain} color={T.gold}>Latest Reasoning</SLabel>
                  <ActionTag action={logs[0].action}/>
                  {logs[0].aaveAction&&<div style={{fontSize:10,color:T.purple,marginTop:6}}>🏦 {logs[0].aaveAction}</div>}
                  <p style={{fontSize:12,color:T.textSecondary,lineHeight:1.7,margin:'8px 0 6px'}}>
                    "{logs[0].reasoning?.slice(0,150)}{logs[0].reasoning?.length>150?'...':''}"
                  </p>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.textMuted}}>
                    <span>Conf: <strong style={{color:T.purple}}>{logs[0].confidence}/10</strong></span>
                    <span>Risk: <strong style={{color:fgiColor}}>{logs[0].riskLevel||'N/A'}</strong></span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Equity Chart */}
        <BacktestPanel/>
        <EquityChart history={port.history||[]}/>

        {/* Architecture */}
        <Card>
          <div style={{padding:'18px 24px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <SLabel icon={Ic.Zap}>3-Layer Autonomous Architecture</SLabel>
              <div style={{fontSize:11,color:T.textMuted}}>
                Every {status?.config?.pollIntervalMinutes||5} min · Zero triggers · WDK + Aave V3 · Apache 2.0
              </div>
            </div>
            <ArchFlow/>
          </div>
        </Card>

        {/* Footer — clean, no BD line */}
        <div style={{textAlign:'center',marginTop:16,padding:'12px 0',fontSize:11,color:T.textMuted+'60',letterSpacing:'0.03em'}}>
          XAU₮Anchor · Tether Hackathon Galactica: WDK Edition 1 · Polygon Amoy Testnet · Auto-refresh 8s
          {status?.circuitBreakerTripped&&(
            <span style={{color:T.red,marginLeft:12}}>⚠️ Circuit Breaker Active</span>
          )}
        </div>
      </div>
    </div>
  )
}
