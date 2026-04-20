import { useState, useEffect, useRef } from "react";

// ── DATES ─────────────────────────────────────────────────────────────────────
// Plan: Mon 21 Apr 2026 → Marathon Sun 18 Oct 2026

const getRealDate = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const PLAN_START  = new Date(2026, 3, 21);  // Mon 21 Apr 2026
const MARATHON    = new Date(2026, 9, 18);  // Sun 18 Oct 2026

const getDayIndex = () => {
  const today = getRealDate();
  return Math.round((today - PLAN_START) / 86400000);
};

const planStarted  = () => getDayIndex() >= 0;
const planWeekNum  = () => Math.floor(Math.max(0, getDayIndex()) / 7) + 1;
const planDayNum   = () => Math.max(0, getDayIndex()) + 1;
const planDOW      = () => Math.max(0, getDayIndex()) % 7; // 0=Mon…6=Sun
const daysToRace   = () => Math.round((MARATHON - getRealDate()) / 86400000);
const todayStr     = () => {
  const d = getRealDate();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

// ── DATA ──────────────────────────────────────────────────────────────────────

const MEALS = [
  { id:"breakfast",  time:"07:30", label:"Breakfast",   kcal:480, protein:30, detail:"4 eggs on 2 slices wholegrain toast" },
  { id:"lunch",      time:"12:30", label:"Lunch",        kcal:520, protein:48, detail:"Mon/Wed/Fri: 2 tins tuna + rice + veg  |  Tue/Thu/Sat: sardines + boiled eggs + salad" },
  { id:"preworkout", time:"15:00", label:"Pre-Workout",  kcal:230, protein:14, detail:"1 banana + 2 boiled eggs" },
  { id:"dinner",     time:"19:00", label:"Dinner",       kcal:700, protein:65, detail:"See rotation" },
  { id:"evening",    time:"21:00", label:"Evening",      kcal:190, protein:19, detail:"Greek yoghurt OR 3 boiled eggs" },
];

const DINNER = {
  0:"Chicken thighs + rice + broccoli (from Sunday batch)",
  1:"Chicken thighs + rice + broccoli (reheated)",
  2:"Chicken thighs + rice + broccoli (reheated)",
  3:"Beef mince + rice + mixed veg (cook fresh, extra for Thu)",
  4:"Beef mince + rice + mixed veg (reheated)",
  5:"Tinned fish + rice + spinach (long run day — extra rice)",
  6:"Sardines/tuna + rice + spinach (HYROX — batch cook chicken tonight)",
};

const TRAINING = {
  0:{ label:"Monday",    type:"functional", name:"Functional Fitness", note:"Add 20–25 min Z2 run after class" },
  1:{ label:"Tuesday",   type:"hyrox",      name:"HYROX",              note:"Full effort. No extras." },
  2:{ label:"Wednesday", type:"functional", name:"Functional Fitness", note:"Add 30 min Z2 run after class" },
  3:{ label:"Thursday",  type:"hyrox",      name:"HYROX",              note:"Full effort. No extras." },
  4:{ label:"Friday",    type:"run",        name:"Long Run",           note:"Zone 2 only — conversational pace" },
  5:{ label:"Saturday",  type:"rest",       name:"Rest Day",           note:"Walk 10k+ steps. No training." },
  6:{ label:"Sunday",    type:"hyrox",      name:"HYROX",              note:"Full effort. Batch cook chicken tonight." },
};

const PHASES = [
  { id:1, name:"Phase 1 — Hard Cut",   dates:"21 Apr → 18 Jun", target:"99kg → 88–89kg",    kcal:2400, protein:190, carbs:230, fat:62,  restKcal:1900, color:"#e8350a" },
  { id:2, name:"Phase 2 — Lean Build", dates:"Post-Holiday → 1 Sep", target:"88–89kg → 86–87kg", kcal:2700, protein:195, carbs:290, fat:68,  restKcal:2200, color:"#1a6e3c" },
  { id:3, name:"Phase 3 — Race Prep",  dates:"1 Sep → 18 Oct", target:"Maintain 86–87kg",   kcal:3000, protein:190, carbs:360, fat:72,  restKcal:2800, color:"#1a4a8a" },
];

const KEY_DATES = [
  { date:"May 2026",  icon:"🏕️", label:"Camping Weekend",   note:"Drink freely. Drop to 2,200 kcal the week before. Straight back on plan Monday." },
  { date:"18 Jun",    icon:"🏖️", label:"Lads Holiday",      note:"Phase 1 ends. Target 88–89kg, 12–13% BF. Final week: 4–5L water, reduce sodium." },
  { date:"Post-Hol",  icon:"💪", label:"Phase 2 Begins",    note:"2,700 kcal. Smaller deficit. Marathon volume builds." },
  { date:"18 Oct",    icon:"🏃", label:"Marathon — Race Day",note:"Carb load Thu 15, Fri 16, Sat 17 Oct. 60–90g carbs/hr from mile 4. Start conservative." },
];

const FRIDAY_RUNS = [
  ["Wks 1–2",  "6–8km",        "25 Apr & 2 May. Run/walk fine. Very easy."],
  ["Wks 3–4",  "8–10km",       "Continuous. Conversational throughout."],
  ["Wks 5–6",  "10–12km",      "Comfortable easy effort."],
  ["Wks 7–8",  "12–16km",      "Final weeks of Phase 1. Strong here = on track for June 18."],
  ["Wks 9–11", "16–19km",      "Phase 2. Fuel with banana or dates."],
  ["Wks 12–14","19–22km",      "Electrolytes every run over 90 min."],
  ["Wks 15–17","22–26km",      "Hard block. 8hrs sleep minimum."],
  ["Wk 18",    "28–30km",      "~18 Sep. Peak run. Eat plenty. Don't race it."],
  ["Wk 19",    "22km",         "~25 Sep. Taper begins."],
  ["Wk 20",    "16km",         "~2 Oct. Volume drops sharply."],
  ["Wk 21",    "10km easy",    "~9 Oct. Very easy. Trust the training."],
  ["Wk 22",    "5km shakeout", "Mon 12 Oct only. Carb load Thu–Sat. REST. Race Sun 18 Oct."],
];

const SHOP = [
  { cat:"Protein", items:["Chicken thighs bone-in 1.5kg","Free range eggs x24 (2 packs)","Tuna in brine x8 tins","Sardines in oil x4 tins","Beef mince 750g","Greek yoghurt 500g"] },
  { cat:"Carbs",   items:["Wholegrain bread 800g loaf","White rice 2kg","Bananas x6–7","Baked beans x2 tins","Tinned tomatoes x2"] },
  { cat:"Frozen Veg", items:["Broccoli florets 1kg","Mixed vegetables 1kg","Leaf spinach 900g"] },
  { cat:"Dairy",   items:["Milk 2L"] },
  { cat:"Staples (buy once)", items:["Sunflower oil","Soy sauce","Garlic bulb","Paprika + herbs","Instant coffee"] },
];

// ── STORAGE ───────────────────────────────────────────────────────────────────

const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ── ICONS ─────────────────────────────────────────────────────────────────────

const Ico = ({ n, s=20 }) => {
  const icons = {
    home:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    camera: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    chart:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    book:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    check:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>,
    trash:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    chev:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>,
  };
  return icons[n] || null;
};

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,      setTab]      = useState("today");
  const [phase,    setPhase]    = useState(() => load("gphase", 1));
  const [weight,   setWeight]   = useState(() => load("gcurrweight", 99));
  const [checkins, setCheckins] = useState(() => load("gcheckins", []));
  const [toast,    setToast]    = useState(null);
  const [now,      setNow]      = useState(() => todayStr());

  // Re-check date every minute so day rolls over automatically
  useEffect(() => {
    const t = setInterval(() => setNow(todayStr()), 60000);
    return () => clearInterval(t);
  }, []);

  const dk = now;
  const [ticks, setTicks] = useState(() => load("gticks_" + dk, { meals:{}, training:false, walk:false }));

  // Reset ticks when date changes
  useEffect(() => {
    setTicks(load("gticks_" + dk, { meals:{}, training:false, walk:false }));
  }, [dk]);

  useEffect(() => { save("gticks_" + dk, ticks); },   [ticks, dk]);
  useEffect(() => { save("gphase", phase); },         [phase]);
  useEffect(() => { save("gcurrweight", weight); },   [weight]);
  useEffect(() => { save("gcheckins", checkins); },   [checkins]);

  const flash = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null), 2600); };
  const tickMeal  = id => setTicks(t => ({...t, meals:{...t.meals,[id]:!t.meals[id]}}));
  const tickTrain = ()  => setTicks(t => ({...t, training:!t.training}));
  const tickWalk  = ()  => setTicks(t => ({...t, walk:!t.walk}));

  const started  = planStarted();
  const dow      = planDOW();
  const phase_   = PHASES.find(p => p.id === phase);
  const isRest   = dow === 5;
  const kcalLogged    = MEALS.filter(m=>ticks.meals[m.id]).reduce((s,m)=>s+m.kcal,0);
  const proteinLogged = MEALS.filter(m=>ticks.meals[m.id]).reduce((s,m)=>s+m.protein,0);
  const mealsLogged   = MEALS.filter(m=>ticks.meals[m.id]).length;
  const dtRace   = daysToRace();

  return (
    <div style={{minHeight:"100vh",background:"#111",color:"#f0ede6",fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;border:none;background:none;color:inherit;font-family:inherit}
        input{font-family:inherit}
        .mono{font-family:'DM Mono',monospace}
        .bb{font-family:'Bebas Neue',sans-serif}
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fu 0.3s ease both}
        @keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#333}
        input[type=number]::-webkit-inner-spin-button{opacity:1}
      `}</style>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"#0a0a0a",borderBottom:"1px solid #222",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div className="bb" style={{fontSize:22,color:"#c8f53a",lineHeight:1}}>GARETH</div>
          <div className="mono" style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:"0.12em",marginTop:2}}>
            {started
              ? `Wk ${planWeekNum()} · Day ${planDayNum()} · ${dtRace > 0 ? dtRace+"d to race" : dtRace === 0 ? "RACE DAY 🏃" : "Marathon done!"}`
              : `Starts ${PLAN_START.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div className="bb" style={{fontSize:20,lineHeight:1}}>{weight}kg</div>
            <div className="mono" style={{fontSize:9,color:"#555",textTransform:"uppercase"}}>current</div>
          </div>
          <button onClick={()=>setTab("plan")} style={{background:"#c8f53a22",border:"1px solid #c8f53a44",borderRadius:4,padding:"4px 10px"}}>
            <div className="mono" style={{fontSize:10,color:"#c8f53a",textTransform:"uppercase",letterSpacing:"0.1em"}}>P{phase}</div>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>
        {tab==="today"    && <TodayTab ticks={ticks} tickMeal={tickMeal} tickTrain={tickTrain} tickWalk={tickWalk} mealsLogged={mealsLogged} kcalLogged={kcalLogged} proteinLogged={proteinLogged} dow={dow} phase_={phase_} isRest={isRest} flash={flash} started={started} />}
        {tab==="checkin"  && <CheckinTab checkins={checkins} setCheckins={setCheckins} weight={weight} setWeight={setWeight} phase={phase} flash={flash} />}
        {tab==="progress" && <ProgressTab checkins={checkins} setCheckins={setCheckins} />}
        {tab==="plan"     && <PlanTab phase={phase} setPhase={setPhase} phase_={phase_} />}
      </div>

      {/* NAV */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #222",display:"flex",zIndex:50}}>
        {[["today","home","Today"],["checkin","camera","Check-in"],["progress","chart","Progress"],["plan","book","Plan"]].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:"11px 0 9px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              color:tab===id?"#c8f53a":"#555",
              borderTop:tab===id?"2px solid #c8f53a":"2px solid transparent"}}>
            <Ico n={icon} s={20}/>
            <span className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="err"?"#e8350a":"#1a9e50",color:"#fff",
          padding:"10px 20px",borderRadius:4,fontSize:13,fontWeight:600,zIndex:100,
          whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",animation:"su 0.25s ease"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── TODAY TAB ─────────────────────────────────────────────────────────────────

function TodayTab({ticks,tickMeal,tickTrain,tickWalk,mealsLogged,kcalLogged,proteinLogged,dow,phase_,isRest,flash,started}) {
  const t   = TRAINING[dow];
  const tc  = {hyrox:"#e8350a",functional:"#1a9e50",run:"#2a6ae8",rest:"#555"};
  const tgt = isRest ? phase_.restKcal : phase_.kcal;
  const all = mealsLogged===MEALS.length && ticks.training && ticks.walk;

  if (!started) return (
    <div className="fu" style={{paddingTop:36,textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:12}}>📅</div>
      <div className="bb" style={{fontSize:36,color:"#c8f53a",letterSpacing:"0.04em"}}>Plan Not Started Yet</div>
      <div style={{fontSize:14,color:"#555",marginTop:12,lineHeight:1.6}}>
        Starts {PLAN_START.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
      </div>
    </div>
  );

  return (
    <div className="fu">
      <div style={{padding:"20px 0 14px"}}>
        <div className="bb" style={{fontSize:40,lineHeight:1}}>{t.label.toUpperCase()}</div>
        <div className="mono" style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:"0.14em",marginTop:3}}>
          {phase_.name} · {isRest?`${tgt} kcal rest`:`${tgt} kcal training`}
        </div>
      </div>

      <Box style={{marginBottom:10,padding:16}}>
        <Bar label="Calories" curr={kcalLogged}    target={tgt}           pct={Math.min(100,Math.round(kcalLogged/tgt*100))}           color="#e8a030" unit="kcal"/>
        <div style={{height:10}}/>
        <Bar label="Protein"  curr={proteinLogged} target={phase_.protein} pct={Math.min(100,Math.round(proteinLogged/phase_.protein*100))} color="#c8f53a" unit="g"/>
        <div style={{height:12}}/>
        <div style={{height:3,background:"#1a1a1a",borderRadius:2}}>
          <div style={{height:"100%",width:`${(mealsLogged/MEALS.length)*100}%`,background:"#c8f53a33",borderRadius:2,transition:"width 0.4s"}}/>
        </div>
        <div className="mono" style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:5}}>{mealsLogged}/{MEALS.length} meals ticked</div>
      </Box>

      <Box style={{marginBottom:10,overflow:"hidden",padding:0}}>
        <div className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",color:"#555",padding:"10px 16px 8px",borderBottom:"1px solid #1a1a1a"}}>Training</div>
        <Row done={ticks.training} onTick={tickTrain} color={tc[t.type]} title={t.name} sub={t.note} badge={t.type.toUpperCase()}/>
        <div style={{height:1,background:"#1a1a1a"}}/>
        <Row done={ticks.walk} onTick={tickWalk} color="#1a9e50" title="Morning Dog Walk" sub="45 min · silent deficit · every day" badge="WALK"/>
      </Box>

      <Box style={{marginBottom:10,overflow:"hidden",padding:0}}>
        <div className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",color:"#555",padding:"10px 16px 8px",borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between"}}>
          <span>Meals</span>
          {isRest && <span style={{color:"#e8a030"}}>Rest day — less carbs</span>}
        </div>
        {MEALS.map((meal,i)=>{
          const detail = meal.id==="dinner" ? DINNER[dow] : meal.detail;
          const done   = !!ticks.meals[meal.id];
          return (
            <div key={meal.id}>
              {i>0 && <div style={{height:1,background:"#1a1a1a"}}/>}
              <div onClick={()=>{tickMeal(meal.id);if(!done)flash("✓ "+meal.label);}}
                style={{padding:"13px 16px",display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",
                  background:done?"rgba(200,245,58,0.04)":"transparent",transition:"background 0.15s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,marginTop:1,
                  border:`2px solid ${done?"#c8f53a":"#333"}`,background:done?"#c8f53a":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",color:"#111",transition:"all 0.15s"}}>
                  {done && <Ico n="check" s={12}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                    <div style={{fontWeight:600,fontSize:13,color:done?"#444":"#f0ede6",textDecoration:done?"line-through":"none"}}>{meal.label}</div>
                    <div className="mono" style={{fontSize:9,color:"#444",flexShrink:0}}>{meal.time}</div>
                  </div>
                  <div style={{fontSize:12,color:done?"#444":"#666",marginTop:3,lineHeight:1.4}}>{detail}</div>
                  <div style={{display:"flex",gap:10,marginTop:5}}>
                    <span className="mono" style={{fontSize:10,color:done?"#444":"#e8a030"}}>{meal.kcal} kcal</span>
                    <span className="mono" style={{fontSize:10,color:done?"#444":"#c8f53a"}}>{meal.protein}g protein</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Box>

      {all && (
        <div style={{background:"rgba(200,245,58,0.06)",border:"1px solid rgba(200,245,58,0.2)",borderRadius:6,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:28,marginBottom:6}}>🔥</div>
          <div className="bb" style={{fontSize:24,color:"#c8f53a",letterSpacing:"0.04em"}}>Perfect Day</div>
          <div style={{fontSize:13,color:"#555",marginTop:4}}>Every meal and session logged. This is how it gets done.</div>
        </div>
      )}
    </div>
  );
}

function Bar({label,curr,target,pct,color,unit}) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"#555"}}>{label}</span>
        <span className="mono" style={{fontSize:10,color}}>{curr}<span style={{color:"#444"}}>/{target}{unit}</span></span>
      </div>
      <div style={{height:4,background:"#1a1a1a",borderRadius:2}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:2,transition:"width 0.4s"}}/>
      </div>
    </div>
  );
}

function Row({done,onTick,color,title,sub,badge}) {
  return (
    <div onClick={onTick}
      style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",
        background:done?"rgba(26,158,80,0.06)":"transparent",transition:"background 0.15s"}}>
      <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,
        border:`2px solid ${done?color:"#333"}`,background:done?color:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",color:"#111",transition:"all 0.15s"}}>
        {done && <Ico n="check" s={13}/>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:600,fontSize:13,color:done?"#555":"#f0ede6",textDecoration:done?"line-through":"none"}}>{title}</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>{sub}</div>
      </div>
      <div className="mono" style={{fontSize:9,padding:"3px 7px",borderRadius:3,background:color+"22",color,textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>{badge}</div>
    </div>
  );
}

// ── CHECK-IN TAB ──────────────────────────────────────────────────────────────

function CheckinTab({checkins,setCheckins,weight,setWeight,phase,flash}) {
  const [front,  setFront]  = useState(null);
  const [side,   setSide]   = useState(null);
  const [wIn,    setWIn]    = useState(weight);
  const [loading,setLoading]= useState(false);
  const [result, setResult] = useState(null);
  const fRef=useRef(); const sRef=useRef();

  const rf = f => new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f);});
  const pick = async (e,isSide) => {if(e.target.files[0]){const d=await rf(e.target.files[0]);isSide?setSide(d):setFront(d);}};
  const last = checkins.length>0?checkins[checkins.length-1]:null;
  const phInfo=["","Phase 1: 2400kcal 190g protein hard cut","Phase 2: 2700kcal 195g protein lean build","Phase 3: 3000kcal maintenance marathon taper"][phase];

  const run = async () => {
    if(!front&&!side){flash("Upload at least one photo","err");return;}
    setLoading(true);setResult(null);
    const content=[];
    if(front)content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:front.split(",")[1]}});
    if(side) content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:side.split(",")[1]}});
    content.push({type:"text",text:
`Analyse progress photos for this specific athlete.
PROFILE: Male, 38yo, 6ft 6in, started 99kg 20% BF April 2026.
NOW: ${wIn}kg, Week ${planWeekNum()}, ${phInfo}
PREVIOUS: ${last?`${last.date}, ${last.weight}kg, ${last.bf}% BF`:"None - first check-in"}
GOAL: Clear visible abs by October marathon. Target 14% BF.
TRAINING: Hyrox 3x/week, functional fitness 2x/week, long runs Fridays, 45min dog walk daily.
DIET: 4 eggs on toast breakfast, tuna/sardine rice lunch, banana+eggs 3pm, rice+veg+protein dinner, Greek yoghurt evening. 30 pounds/week Lidl UK.

Respond in EXACTLY this format:

BF: [number only]
STATUS: [ON TRACK or AHEAD or BEHIND]
HEADLINE: [one punchy line max 12 words]

ASSESSMENT:
[2 paragraphs: estimate BF from photos with reasoning. Describe midsection front and side. Compare to previous if exists.]

CHANGES:
[1-2 paragraphs: what has visibly improved, what is still soft.]

PLAN:
[Specific adjustments. Exact numbers. Stay within 30 pound Lidl budget.]`
    });
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content}]})});
      const data=await res.json();
      const text=(data.content||[]).map(b=>b.text||"").join("");
      const bf  =(text.match(/^BF:\s*([\d.]+)/m)||[])[1]||"--";
      const stat=(text.match(/^STATUS:\s*(.+)/m)||[])[1]?.trim()||"--";
      const hl  =(text.match(/^HEADLINE:\s*(.+)/m)||[])[1]?.trim()||"";
      const ass =(text.match(/ASSESSMENT:\n([\s\S]+?)(?=\nCHANGES:|$)/)||[])[1]?.trim()||"";
      const chg =(text.match(/CHANGES:\n([\s\S]+?)(?=\nPLAN:|$)/)||[])[1]?.trim()||"";
      const pl  =(text.match(/PLAN:\n([\s\S]+?)$/)||[])[1]?.trim()||"";
      const entry={date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),weight:parseFloat(wIn)||weight,bf,status:stat,headline:hl,assess:ass,changes:chg,plan:pl,phase,week:planWeekNum(),frontImg:front,sideImg:side};
      setResult(entry);setCheckins(p=>[...p,entry]);setWeight(entry.weight);flash("Check-in saved");
    } catch{flash("Connection error","err");}
    setLoading(false);
  };

  const sc=s=>s==="AHEAD"?"#1a9e50":s==="BEHIND"?"#e8350a":"#e8a030";

  return (
    <div className="fu" style={{paddingTop:20}}>
      <div className="bb" style={{fontSize:32,letterSpacing:"0.03em",marginBottom:3}}>Weekly Check-In</div>
      <div style={{fontSize:13,color:"#555",marginBottom:20}}>Week {planWeekNum()} · {last?`Last: ${last.date} — ${last.bf}% BF`:"First check-in"}</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[{ref:fRef,img:front,isSide:false,label:"Front"},{ref:sRef,img:side,isSide:true,label:"Side"}].map(({ref,img,isSide,label})=>(
          <div key={label} onClick={()=>ref.current?.click()}
            style={{background:"#191919",border:`1px solid ${img?"#c8f53a":"#333"}`,borderRadius:6,height:150,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
              cursor:"pointer",overflow:"hidden",position:"relative",transition:"border-color 0.2s"}}>
            <input ref={ref} type="file" accept="image/*" capture="environment" onChange={e=>pick(e,isSide)} style={{display:"none"}}/>
            {img?<img src={img} style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
              :<><Ico n="camera" s={24}/><span className="mono" style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:"#555"}}>{label}</span></>}
            {img&&<div style={{position:"absolute",bottom:6,right:6,background:"#c8f53a",borderRadius:3,padding:"2px 8px"}}><span className="mono" style={{fontSize:9,color:"#111"}}>✓</span></div>}
          </div>
        ))}
      </div>

      <Box style={{marginBottom:12,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div>
          <div className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:"#555",marginBottom:3}}>This morning's weight</div>
          <div style={{fontSize:12,color:"#555"}}>After bathroom, before eating</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <input type="number" value={wIn} step="0.1" min="70" max="130" onChange={e=>setWIn(e.target.value)}
            style={{width:68,background:"#222",border:"1px solid #333",borderRadius:4,padding:"8px 10px",fontSize:18,color:"#f0ede6",textAlign:"center",fontWeight:600}}/>
          <span style={{fontSize:13,color:"#555"}}>kg</span>
        </div>
      </Box>

      <button onClick={run} disabled={loading}
        style={{width:"100%",background:loading?"#333":"#c8f53a",color:"#111",padding:14,borderRadius:6,
          fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:"0.08em",marginBottom:14,transition:"background 0.2s"}}>
        {loading?"ANALYSING...":"ANALYSE MY PROGRESS"}
      </button>

      {loading&&<Box style={{padding:24,textAlign:"center",marginBottom:14}}><div style={{fontSize:24,marginBottom:8}}>🔍</div><div className="mono" style={{fontSize:12,color:"#555"}}>Estimating body fat from photos...</div></Box>}

      {result&&(
        <div className="fu" style={{background:"#191919",border:"1px solid #333",borderRadius:6,overflow:"hidden",marginBottom:14}}>
          <div style={{background:"#0a0a0a",padding:"13px 16px",borderBottom:"1px solid #222"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div className="bb" style={{fontSize:18,letterSpacing:"0.04em"}}>Analysis</div>
              <div className="mono" style={{fontSize:10,color:"#555"}}>{result.date}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Body Fat",result.bf+"%","#c8f53a"],["Weight",result.weight+"kg","#f0ede6"],["Status",result.status,sc(result.status)]].map(([l,v,c])=>(
                <div key={l} style={{background:"#111",padding:"10px 6px",borderRadius:4,textAlign:"center"}}>
                  <div className="bb" style={{fontSize:22,color:c,lineHeight:1}}>{v}</div>
                  <div className="mono" style={{fontSize:8,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {result.headline&&<div style={{padding:"11px 16px",borderBottom:"1px solid #222",background:"rgba(200,245,58,0.04)",fontSize:13,fontWeight:600,color:"#c8f53a",lineHeight:1.4}}>"{result.headline}"</div>}
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {[["Assessment",result.assess],["Changes",result.changes],["Plan Adjustment",result.plan]].map(([title,body])=>body&&(
              <div key={title}>
                <div style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{title}</div>
                <div style={{fontSize:13,color:"#ccc",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROGRESS TAB ──────────────────────────────────────────────────────────────

function ProgressTab({checkins,setCheckins}) {
  const [open,setOpen]=useState(null);
  const sc=s=>s==="AHEAD"?"#1a9e50":s==="BEHIND"?"#e8350a":"#e8a030";
  const del=i=>{if(!confirm("Delete this check-in?"))return;setCheckins(c=>c.filter((_,j)=>j!==i));};

  if(checkins.length===0) return (
    <div className="fu" style={{paddingTop:48,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:10}}>📸</div>
      <div className="bb" style={{fontSize:24,color:"#555",letterSpacing:"0.04em"}}>No Check-ins Yet</div>
      <div style={{fontSize:13,color:"#555",marginTop:8}}>Do your first weekly check-in to start tracking progress.</div>
    </div>
  );

  const first=checkins[0];const latest=checkins[checkins.length-1];
  const wL=checkins.length>1?(parseFloat(first.weight)-parseFloat(latest.weight)).toFixed(1):null;
  const bL=checkins.length>1?(parseFloat(first.bf)-parseFloat(latest.bf)).toFixed(1):null;

  return (
    <div className="fu" style={{paddingTop:20}}>
      <div className="bb" style={{fontSize:32,letterSpacing:"0.03em",marginBottom:3}}>Progress</div>
      <div style={{fontSize:13,color:"#555",marginBottom:16}}>{checkins.length} check-in{checkins.length!==1?"s":""}</div>

      {checkins.length>1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[["Lost",`-${wL}kg`,"#1a9e50"],["BF Drop",`-${bL}%`,"#c8f53a"],["Weeks",checkins.length,"#f0ede6"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#191919",border:"1px solid #222",borderRadius:6,padding:"13px 10px",textAlign:"center"}}>
              <div className="bb" style={{fontSize:26,color:c,lineHeight:1}}>{v}</div>
              <div className="mono" style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {checkins.length>1&&(
        <Box style={{padding:14,marginBottom:14}}>
          <div className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:"#555",marginBottom:10}}>Weight Trend</div>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:56}}>
            {checkins.map((c,i)=>{
              const vals=checkins.map(x=>parseFloat(x.weight));
              const max=Math.max(...vals);const min=Math.min(...vals);
              const h=max===min?40:Math.round(((parseFloat(c.weight)-min)/(max-min))*36)+8;
              return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:8,color:"#555"}}>{c.weight}</div><div style={{width:"100%",height:h,background:`hsl(${90+i*8},60%,40%)`,borderRadius:"2px 2px 0 0"}}/></div>);
            })}
          </div>
        </Box>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[...checkins].reverse().map((entry,ri)=>{
          const idx=checkins.length-1-ri;const isOpen=open===idx;
          return(
            <div key={idx} style={{background:"#191919",border:"1px solid #222",borderRadius:6,overflow:"hidden"}}>
              <div onClick={()=>setOpen(isOpen?null:idx)} style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <div style={{fontWeight:600,fontSize:13}}>{entry.date}</div>
                    <div className="mono" style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:sc(entry.status)+"22",color:sc(entry.status),textTransform:"uppercase"}}>{entry.status}</div>
                  </div>
                  <div className="mono" style={{fontSize:11,color:"#555"}}>{entry.weight}kg · <span style={{color:"#c8f53a"}}>{entry.bf}% BF</span> · Wk {entry.week}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();del(idx);}} style={{color:"#333",padding:4}} onMouseOver={e=>e.currentTarget.style.color="#e8350a"} onMouseOut={e=>e.currentTarget.style.color="#333"}><Ico n="trash" s={15}/></button>
                <div style={{color:"#444",transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}><Ico n="chev" s={16}/></div>
              </div>
              {isOpen&&(
                <div className="fu" style={{borderTop:"1px solid #222",padding:16}}>
                  {(entry.frontImg||entry.sideImg)&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{entry.frontImg&&<img src={entry.frontImg} style={{width:"100%",height:150,objectFit:"cover",borderRadius:4}}/>}{entry.sideImg&&<img src={entry.sideImg} style={{width:"100%",height:150,objectFit:"cover",borderRadius:4}}/>}</div>)}
                  {entry.headline&&<div style={{fontSize:13,fontWeight:600,color:"#c8f53a",marginBottom:10,lineHeight:1.4}}>"{entry.headline}"</div>}
                  {[["Assessment",entry.assess],["Changes",entry.changes],["Plan Adjustment",entry.plan]].map(([t,b])=>b&&(<div key={t} style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{t}</div><div style={{fontSize:12,color:"#aaa",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{b}</div></div>))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PLAN TAB ──────────────────────────────────────────────────────────────────

function PlanTab({phase,setPhase,phase_}) {
  const [sub,setSub]=useState("overview");
  const tc={hyrox:"#e8350a",functional:"#1a9e50",run:"#2a6ae8",rest:"#555"};

  return (
    <div className="fu" style={{paddingTop:20}}>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {PHASES.map(p=>(
          <button key={p.id} onClick={()=>setPhase(p.id)}
            style={{flex:1,padding:"9px 4px",background:phase===p.id?p.color:"#191919",
              border:`1px solid ${phase===p.id?p.color:"#333"}`,borderRadius:4,
              color:phase===p.id?"#fff":"#555",fontSize:12,fontWeight:600,transition:"all 0.15s"}}>P{p.id}</button>
        ))}
      </div>

      <Box style={{marginBottom:14,padding:16,borderLeft:`3px solid ${phase_.color}`}}>
        <div className="bb" style={{fontSize:20,letterSpacing:"0.03em",marginBottom:2}}>{phase_.name}</div>
        <div className="mono" style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{phase_.dates} · {phase_.target}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[["Kcal",phase_.kcal,"#e8a030"],["Protein",phase_.protein+"g","#c8f53a"],["Carbs",phase_.carbs+"g","#7eb8f7"],["Fat",phase_.fat+"g","#c47ef7"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#111",padding:"8px 6px",borderRadius:4,textAlign:"center"}}>
              <div className="bb" style={{fontSize:18,color:c,lineHeight:1}}>{v}</div>
              <div className="mono" style={{fontSize:8,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,padding:"7px 10px",background:"#111",borderRadius:4}}>
          <span className="mono" style={{fontSize:10,color:"#555"}}>Rest day (Sat): </span>
          <span className="mono" style={{fontSize:10}}>{phase_.restKcal} kcal · same protein · less carbs</span>
        </div>
      </Box>

      <div style={{display:"flex",gap:0,marginBottom:14,background:"#0a0a0a",borderRadius:6,overflow:"hidden",border:"1px solid #222"}}>
        {[["overview","Overview"],["meals","Meals"],["training","Training"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSub(id)} style={{flex:1,padding:"10px 0",background:sub===id?"#c8f53a":"transparent",color:sub===id?"#111":"#555",fontSize:12,fontWeight:sub===id?700:400,transition:"all 0.15s"}}>{label}</button>
        ))}
      </div>

      {sub==="overview"&&(
        <div>
          <SL>Key Dates</SL>
          {KEY_DATES.map(({date,icon,label,note})=>(
            <div key={date} style={{display:"flex",gap:12,padding:"11px 14px",background:"#191919",border:"1px solid #222",borderRadius:4,marginBottom:6}}>
              <div className="mono" style={{fontSize:10,color:"#c8f53a",minWidth:64,paddingTop:1}}>{date}</div>
              <div><div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{icon} {label}</div><div style={{fontSize:12,color:"#555",lineHeight:1.4}}>{note}</div></div>
            </div>
          ))}
          <SL style={{marginTop:20}}>Non-Negotiables</SL>
          {[["🥩","190g+ protein every day"],["😴","8hrs sleep minimum"],["🍺","Max 1 drink/week until June 18"],["📱","Track food in MyFitnessPal for first 8 weeks"],["🐾","Dog walk every morning — silent deficit"],["🏃","80% of running in Zone 2"]].map(([i,t])=>(
            <div key={t} style={{display:"flex",gap:12,padding:"11px 14px",background:"#191919",border:"1px solid #222",borderRadius:4,marginBottom:6}}><span style={{fontSize:16}}>{i}</span><span style={{fontSize:13,color:"#ccc"}}>{t}</span></div>
          ))}
        </div>
      )}

      {sub==="meals"&&(
        <div>
          <SL>Daily Schedule</SL>
          {MEALS.map(m=>(
            <Box key={m.id} style={{padding:14,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:13}}>{m.label}</div>
                <div className="mono" style={{fontSize:10,color:"#555"}}>{m.time}</div>
              </div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.4,marginBottom:6}}>{m.detail}</div>
              <div style={{display:"flex",gap:10}}>
                <span className="mono" style={{fontSize:10,color:"#e8a030"}}>{m.kcal} kcal</span>
                <span className="mono" style={{fontSize:10,color:"#c8f53a"}}>{m.protein}g protein</span>
              </div>
            </Box>
          ))}
          <SL style={{marginTop:20}}>Dinner Rotation</SL>
          {Object.entries(DINNER).map(([d,meal])=>{
            const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
            return(<div key={d} style={{display:"flex",gap:12,padding:"10px 14px",background:"#191919",border:"1px solid #222",borderRadius:4,marginBottom:6}}><div className="mono" style={{fontSize:10,color:"#c8f53a",minWidth:30,paddingTop:1}}>{days[d].slice(0,3).toUpperCase()}</div><div style={{fontSize:12,color:"#ccc",lineHeight:1.4}}>{meal}</div></div>);
          })}
          <SL style={{marginTop:20}}>Weekly Lidl Shop (~£30)</SL>
          {SHOP.map(({cat,items})=>(
            <div key={cat} style={{background:"#191919",border:"1px solid #222",borderRadius:6,overflow:"hidden",marginBottom:8}}>
              <div style={{background:"#0a0a0a",padding:"8px 14px",borderBottom:"1px solid #222"}}><span className="mono" style={{fontSize:9,color:"#c8f53a",textTransform:"uppercase",letterSpacing:"0.12em"}}>{cat}</span></div>
              {items.map(item=>(<div key={item} style={{padding:"8px 14px",borderBottom:"1px solid #1a1a1a",fontSize:12,color:"#aaa"}}>{item}</div>))}
            </div>
          ))}
        </div>
      )}

      {sub==="training"&&(
        <div>
          <SL>Weekly Schedule</SL>
          {Object.entries(TRAINING).map(([d,t])=>(
            <div key={d} style={{display:"flex",gap:12,padding:"11px 14px",background:"#191919",border:"1px solid #222",borderRadius:4,marginBottom:6,alignItems:"center"}}>
              <div className="mono" style={{fontSize:10,color:"#555",minWidth:30}}>{t.label.slice(0,3).toUpperCase()}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:tc[t.type]}}>{t.name}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>{t.note}</div></div>
              <div className="mono" style={{fontSize:9,padding:"3px 7px",borderRadius:3,background:tc[t.type]+"22",color:tc[t.type],textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>{t.type}</div>
            </div>
          ))}
          <SL style={{marginTop:20}}>Friday Long Run Build</SL>
          {FRIDAY_RUNS.map(([wk,dist,note])=>(
            <div key={wk} style={{display:"grid",gridTemplateColumns:"56px 80px 1fr",gap:8,padding:"10px 14px",background:"#191919",border:"1px solid #222",borderRadius:4,marginBottom:6,alignItems:"start"}}>
              <div className="mono" style={{fontSize:10,color:"#c8f53a",paddingTop:1}}>{wk}</div>
              <div style={{fontWeight:600,fontSize:13}}>{dist}</div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.4}}>{note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Box({children,style={}}) {
  return <div style={{background:"#191919",border:"1px solid #222",borderRadius:6,...style}}>{children}</div>;
}
function SL({children,style={}}) {
  return <div className="mono" style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",color:"#555",marginBottom:10,...style}}>{children}</div>;
}
