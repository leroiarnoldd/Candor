import { useState, useEffect, useRef } from "react";

const STYLES = `
  @import url('https://rsms.me/inter/inter.css');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  :root {
    --bg:#000; --s1:#0A0A0A; --s2:#111; --s3:#1A1A1A; --s4:#222; --s5:#2E2E2E; --s6:#3A3A3A;
    --w1:#fff; --w2:#E8E8E8; --w3:#A0A0A0; --w4:#606060; --w5:#3A3A3A;
    --bdr:rgba(255,255,255,.07); --bdr2:rgba(255,255,255,.12); --bdr3:rgba(255,255,255,.20);
  }
  body {
    font-family: InterVariable, Inter, sans-serif;
    font-feature-settings: "liga" 1,"calt" 1,"cv05" 1,"ss01" 1;
    background: var(--bg); color: var(--w3);
    line-height: 1.6; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  body::after {
    content:""; position:fixed; inset:0; z-index:9999; pointer-events:none; opacity:.018;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  /* hide scrollbars on snap containers */
  .snap-scroll::-webkit-scrollbar { display: none; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes throb  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(.65)} }
  .f1{animation:fadeUp .55s ease .04s both}
  .f2{animation:fadeUp .55s ease .16s both}
  .f3{animation:fadeUp .55s ease .28s both}
  .f4{animation:fadeUp .55s ease .42s both}
  .f5{animation:fadeUp .80s ease .56s both}
`;

const Mark = ({ size = 24 }) => (
  <div style={{ width:size, height:size, borderRadius:Math.round(size*.28), background:"var(--w1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <svg width={size*.5} height={size*.5} viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
      <circle cx="6" cy="6" r="1.7" fill="black"/>
    </svg>
  </div>
);

const DRow = ({ label, value, hi, salary }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--bdr)" }}>
    <span style={{ fontSize:12, color:"var(--w4)" }}>{label}</span>
    <span style={{ fontSize:12.5, fontWeight:600, color: salary ? "#4B7BFF" : hi ? "var(--w1)" : "var(--w2)" }}>{value}</span>
  </div>
);

const PCard = ({ company, stage, location, culture, salary, msg, tags, featured, logoBg, logoColor }) => (
  <div style={{ background: featured ? "var(--s2)" : "var(--s1)", border: featured ? "1px solid var(--bdr2)" : "1px solid var(--bdr)", borderRadius:10, padding:"14px 16px", cursor:"pointer", position:"relative", overflow:"hidden" }}>
    {featured && <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:"var(--w1)" }}/>}
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
      <div style={{ width:30, height:30, borderRadius:7, background: logoBg || "var(--s4)", border:"1px solid var(--bdr)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, fontWeight:700, color: logoColor || "var(--w3)" }}>{company.slice(0,2).toUpperCase()}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, fontWeight:600, color:"var(--w1)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{company}</div>
        <div style={{ fontSize:11, color:"var(--w4)" }}>{stage} · {location} · {culture}★</div>
      </div>
      <div style={{
        fontSize:11.5, fontWeight:700,
        color: featured ? "var(--w1)" : "#4B7BFF",
        background: featured ? "var(--s5)" : "rgba(75,123,255,.12)",
        border: featured ? "1px solid var(--bdr3)" : "1px solid rgba(75,123,255,.25)",
        padding:"3px 9px", borderRadius:100, whiteSpace:"nowrap", flexShrink:0
      }}>{salary}</div>
    </div>
    <div style={{ fontSize:12.5, color:"var(--w3)", lineHeight:1.55, marginBottom: tags ? 9 : 0 }}>{msg}</div>
    {tags && (
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {tags.map((t,i) => {
          const isVerified = t.includes("Verified");
          return (
            <span key={i} style={{
              fontSize:10.5, padding:"2px 8px", borderRadius:4,
              background: isVerified ? "rgba(35,209,96,.12)" : "var(--s4)",
              color: isVerified ? "#23D160" : "var(--w4)",
              border: isVerified ? "1px solid rgba(35,209,96,.25)" : "1px solid var(--bdr)",
              fontWeight: isVerified ? 600 : 400,
            }}>{t}</span>
          );
        })}
      </div>
    )}
  </div>
);

const Success = ({ pos, code, onCopy, copied }) => {
  const share = (p) => {
    const url = `https://getcandor.com/join?ref=${code}`;
    const txt = encodeURIComponent(`I just joined the Candor waitlist.\n\nCompanies apply to YOU — with their real salary on the first message. You stay anonymous. The job comes to you.\n\nGet early access: ${url}`);
    if (p==="x")  window.open(`https://x.com/intent/tweet?text=${txt}`,"_blank");
    if (p==="li") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,"_blank");
    if (p==="cp") onCopy();
  };
  return (
    <div style={{ background:"var(--s1)", border:"1px solid var(--bdr2)", borderRadius:16, padding:"32px 28px", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:20, animation:"fadeUp .45s ease both" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"var(--w1)" }}/>
      <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--s3)", border:"1px solid var(--bdr2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
      </div>
      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--w4)", marginBottom:6 }}>You are position</div>
        <div style={{ fontSize:64, fontWeight:700, letterSpacing:"-.06em", color:"var(--w1)", lineHeight:1 }}>#{pos.toLocaleString()}</div>
      </div>
      <p style={{ fontSize:14, color:"var(--w3)", lineHeight:1.65 }}>You are on the list. <strong style={{ color:"var(--w2)", fontWeight:500 }}>Share with a friend to move up</strong> — every referral moves you 10 positions closer to launch.</p>
      <div style={{ width:"100%", background:"var(--s2)", border:"1px solid var(--bdr)", borderRadius:12, padding:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--w1)", marginBottom:3 }}>Your referral link</div>
        <div style={{ fontSize:12, color:"var(--w4)", marginBottom:14 }}>Each person who joins through your link moves you up 10 spots.</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <div style={{ flex:1, padding:"9px 13px", borderRadius:8, background:"var(--s3)", border:"1px solid var(--bdr)", fontSize:12, color:"var(--w4)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>getcandor.com/join?ref={code}</div>
          <button onClick={onCopy} style={{ padding:"9px 16px", borderRadius:8, fontFamily:"inherit", fontSize:13, fontWeight:600, background: copied ? "var(--s5)" : "var(--w1)", color: copied ? "var(--w1)" : "var(--bg)", border:"none", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>{copied ? "Copied ✓" : "Copy"}</button>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["Post on X","x"],["LinkedIn","li"],["Copy link","cp"]].map(([l,k]) => (
            <button key={k} onClick={() => share(k)} style={{ flex:1, padding:"9px 6px", borderRadius:8, fontFamily:"inherit", fontSize:12, fontWeight:500, background:"var(--s3)", color:"var(--w3)", border:"1px solid var(--bdr)", cursor:"pointer", transition:"all .15s" }}
              onMouseOver={e=>{e.currentTarget.style.background="var(--s4)";e.currentTarget.style.color="var(--w2)"}}
              onMouseOut={e=>{e.currentTarget.style.background="var(--s3)";e.currentTarget.style.color="var(--w3)"}}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize:11.5, color:"var(--w5)", marginTop:12 }}>Each referral = <strong style={{ color:"var(--w3)" }}>+10 positions</strong> up the list</p>
      </div>
    </div>
  );
};

export default function CandorWaitlist() {
  const [role,setRole]     = useState("pro");
  const [email,setEmail]   = useState("");
  const [err,setErr]       = useState(false);
  const [done,setDone]     = useState(false);
  const [pos,setPos]       = useState(null);
  const [code,setCode]     = useState("");
  const [copied,setCopied] = useState(false);
  const [count,setCount]   = useState(4488);
  const formRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const id = setInterval(() => { if (Math.random()>.6) setCount(c=>c+1); }, 8000);
    return () => clearInterval(id);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
    setTimeout(() => document.getElementById("c-email")?.focus(), 600);
  };

  const join = () => {
    if (!email.includes("@")) { setErr(true); return; }
    setErr(false);
    const p = count + 1;
    const c = Math.random().toString(36).slice(2,10).toUpperCase();
    setPos(p); setCode(c); setCount(p); setDone(true);
  };

  const doCopy = () => {
    navigator.clipboard.writeText(`https://getcandor.com/join?ref=${code}`).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pitches = [
    { company:"Acme Technologies", stage:"Series B", location:"London",  culture:"4.6", salary:"£95k – £115k", msg:"We found your profile and believe your B2B SaaS background is a strong fit. We'd love to tell you more.", tags:["✓ Verified","3 stages","~2 weeks"], featured:true,  logoBg:"#1A2B5E", logoColor:"#4B7BFF" },
    { company:"Meridian Labs",     stage:"Seed",     location:"Remote",  culture:"4.8", salary:"£80k – £100k", msg:"Your payments work caught our attention. Great fit for our product lead role.",                       tags:null,                                  featured:false, logoBg:"#1A3828", logoColor:"#23D160" },
    { company:"Strand Capital",    stage:"Growth",   location:"London",  culture:"4.3", salary:"£120k – £145k",msg:"Your fintech background aligns with our product roadmap for the next 18 months.",                    tags:null,                                  featured:false, logoBg:"#3B1F0A", logoColor:"#F59E0B" },
  ];

  const faces = [
    { i:"AM", bg:"#1A2B5E", c:"#4B7BFF" },
    { i:"SK", bg:"#1A3828", c:"#23D160" },
    { i:"JT", bg:"#3B1F0A", c:"#F59E0B" },
    { i:"RL", bg:"#2D1A1A", c:"#F87171" },
    { i:"MC", bg:"#2A1A3B", c:"#A78BFA" },
  ];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:300, height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", background:"rgba(0,0,0,.90)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--bdr)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <Mark/>
          <span style={{ fontSize:15, fontWeight:600, color:"var(--w1)", letterSpacing:"-.3px" }}>Candor</span>
        </div>
        <button onClick={scrollToForm} style={{ padding:"7px 18px", borderRadius:8, fontFamily:"inherit", fontSize:13.5, fontWeight:600, background:"var(--w1)", color:"var(--bg)", border:"none", cursor:"pointer", transition:"background .15s" }}
          onMouseOver={e=>e.currentTarget.style.background="var(--w2)"}
          onMouseOut={e=>e.currentTarget.style.background="var(--w1)"}>
          Get Early Access
        </button>
      </nav>

      {/* HERO — left aligned */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"120px 40px 80px", position:"relative", overflow:"hidden" }}>
        {/* subtle white glow top left — Linear style */}
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"55%", height:"70%", background:"radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.04) 0%,transparent 65%)", pointerEvents:"none" }}/>
        {/* dot grid fading left */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"radial-gradient(rgba(255,255,255,.10) 1px,transparent 1px)", backgroundSize:"44px 44px", maskImage:"radial-gradient(ellipse 60% 60% at 15% 35%,black 10%,transparent 100%)", WebkitMaskImage:"radial-gradient(ellipse 60% 60% at 15% 35%,black 10%,transparent 100%)" }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:520, width:"100%" }}>

          {/* HEADLINE — Linear font scale, left, weight 700 */}
          <h1 className="f1" style={{ fontSize:"clamp(48px,6.5vw,76px)", fontWeight:700, lineHeight:1.03, letterSpacing:"-0.045em", color:"var(--w1)", marginBottom:20 }}>
            The job comes<br/>to you.
          </h1>

          {/* TENSION LINE — draws the line */}
          <p className="f2" style={{ fontSize:"clamp(13px,1.3vw,15px)", fontWeight:500, color:"var(--w4)", lineHeight:1.5, marginBottom:16, letterSpacing:".01em" }}>
            Every job platform was built for companies.{" "}
            <span style={{ color:"#4B7BFF", fontWeight:600 }}>Candor was built for you.</span>
          </p>
          <p className="f3" style={{ fontSize:"clamp(14px,1.5vw,17px)", fontWeight:400, color:"var(--w3)", lineHeight:1.7, maxWidth:420, marginBottom:44 }}>
            On Candor, companies apply to you — not the other way around.
            Real salary on every message. You stay invisible.
            You choose who is worthy of your time.
          </p>

          {/* FORM */}
          <div ref={formRef} className="f4">
            {done ? (
              <Success pos={pos} code={code} onCopy={doCopy} copied={copied}/>
            ) : (
              <div style={{ maxWidth:460 }}>
                {/* toggle */}
                <div style={{ display:"inline-flex", background:"var(--s2)", border:"1px solid var(--bdr2)", borderRadius:10, padding:3, marginBottom:14 }}>
                  {[{id:"pro",label:"I'm a professional"},{id:"co",label:"I'm a company"}].map(r => (
                    <button key={r.id} onClick={()=>setRole(r.id)} style={{ padding:"8px 22px", borderRadius:8, fontFamily:"inherit", fontSize:13.5, fontWeight:500, background: role===r.id ? "var(--s5)" : "transparent", color: role===r.id ? "var(--w1)" : "var(--w4)", border:"none", cursor:"pointer", transition:"all .18s" }}>{r.label}</button>
                  ))}
                </div>

                {/* email */}
                <input id="c-email" type="email" value={email}
                  onChange={e=>{setEmail(e.target.value);setErr(false);}}
                  onKeyDown={e=>e.key==="Enter"&&join()}
                  placeholder={role==="pro" ? "Your email address" : "Your company email"}
                  style={{ display:"block", width:"100%", padding:"13px 18px", borderRadius:10, border:`1px solid ${err?"rgba(248,113,113,.6)":"var(--bdr2)"}`, background:"rgba(255,255,255,.03)", fontFamily:"inherit", fontSize:15, color:"var(--w1)", outline:"none", marginBottom:10, transition:"border-color .18s,background .18s" }}
                  onFocus={e=>{e.target.style.borderColor="var(--bdr3)";e.target.style.background="rgba(255,255,255,.05)"}}
                  onBlur={e=>{e.target.style.borderColor=err?"rgba(248,113,113,.6)":"var(--bdr2)";e.target.style.background="rgba(255,255,255,.03)"}}
                />

                {/* CTA */}
                <button onClick={join} style={{ display:"block", width:"100%", padding:"13px 18px", borderRadius:10, fontFamily:"inherit", fontSize:15, fontWeight:700, background:"var(--w1)", color:"var(--bg)", border:"none", cursor:"pointer", letterSpacing:"-.1px", transition:"all .18s" }}
                  onMouseOver={e=>{e.currentTarget.style.background="var(--w2)";e.currentTarget.style.transform="translateY(-1px)"}}
                  onMouseOut={e=>{e.currentTarget.style.background="var(--w1)";e.currentTarget.style.transform="translateY(0)"}}>
                  Get early access →
                </button>

                {err && <p style={{ fontSize:12.5, color:"rgba(248,113,113,.8)", marginTop:8 }}>Please enter a valid email address.</p>}
                <p style={{ fontSize:12.5, color:"var(--w5)", marginTop:10 }}>No spam. No recruiters. Unsubscribe any time.</p>
                <p style={{ fontSize:12.5, color:"var(--w4)", marginTop:5, display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--w4)" strokeWidth="1.2" strokeLinecap="round">
                    <rect x="2.5" y="5.5" width="7" height="5" rx="1"/>
                    <path d="M4 5.5V4a2 2 0 014 0v1.5"/>
                  </svg>
                  Your boss will never know you&apos;re here.
                </p>

                {/* live counter */}
                <div className="f5" style={{ display:"flex", alignItems:"center", gap:12, marginTop:28 }}>
                  <div style={{ display:"flex" }}>
                    {faces.map((f,i) => (
                      <div key={i} style={{ width:26, height:26, borderRadius:"50%", border:"2px solid var(--bg)", background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:f.c, marginLeft:i?-7:0, zIndex:faces.length-i }}>{f.i}</div>
                    ))}
                  </div>
                  <span style={{ fontSize:13, color:"var(--w4)" }}>
                    <strong style={{ color:"var(--w2)", fontWeight:600 }}>{count.toLocaleString()} professionals</strong> already waiting
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW — scalable for any device */}
      <section style={{ padding:"100px 40px 120px", background:"var(--s1)", borderTop:"1px solid var(--bdr)" }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#4B7BFF", marginBottom:14 }}>
            <div style={{ width:14, height:1, background:"#4B7BFF" }}/>
            What lands in your inbox when
          </div>

          <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)", fontWeight:700, letterSpacing:"-.04em", color:"var(--w1)", lineHeight:1.08, marginBottom:40 }}>
            7 companies applied to you this week.
          </h2>

          {/* RESPONSIVE GRID — auto-fit stacks on mobile */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16 }}>

            {/* LEFT — pitch inbox */}
            <div style={{ background:"var(--bg)", border:"1px solid var(--bdr2)", borderRadius:14, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.04)", display:"flex", flexDirection:"column" }}>
              {/* browser bar */}
              <div style={{ background:"var(--s2)", padding:"11px 16px", borderBottom:"1px solid var(--bdr)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                <div style={{ display:"flex", gap:5 }}>
                  {["#333","#333","#333"].map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:"50%", background:c }}/>)}
                </div>
                <div style={{ flex:1, background:"var(--s3)", borderRadius:5, padding:"4px 12px", fontSize:11.5, color:"var(--w5)", display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--w4)", flexShrink:0 }}/>
                  <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>getcandor.com / my-pitches</span>
                </div>
              </div>
              <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:10, flex:1 }}>
                <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"var(--w5)", marginBottom:2 }}>7 companies applied to you</div>
                {pitches.map((p,i) => <PCard key={i} {...p}/>)}
              </div>
            </div>

            {/* RIGHT — job detail */}
            <div style={{ background:"var(--bg)", border:"1px solid var(--bdr2)", borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.04)" }}>
              {/* header */}
              <div style={{ background:"var(--s2)", padding:"14px 18px", borderBottom:"1px solid var(--bdr)", position:"relative", overflow:"hidden", flexShrink:0 }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:"var(--w1)" }}/>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#1A2B5E", border:"1px solid rgba(75,123,255,.20)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11.5, fontWeight:700, color:"#4B7BFF", flexShrink:0 }}>AT</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--w1)" }}>Acme Technologies</div>
                    <div style={{ fontSize:11.5, color:"var(--w4)" }}>Series B · 120 people · London</div>
                  </div>
                  <div style={{ padding:"3px 9px", borderRadius:100, background:"rgba(35,209,96,.12)", border:"1px solid rgba(35,209,96,.25)", fontSize:10, fontWeight:700, color:"#23D160", whiteSpace:"nowrap", flexShrink:0 }}>✓ Verified</div>
                </div>
              </div>
              {/* body */}
              <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column" }}>
                <DRow label="Role"             value="Senior Product Manager"/>
                <DRow label="Salary range"     value="£95,000 – £115,000"    salary/>
                <DRow label="Culture score"    value="4.6 / 5 · 94 reviews"/>
                <DRow label="Interview stages" value="3 rounds · ~2 weeks"/>
                <DRow label="Staff turnover"   value="8% annual"             hi/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0" }}>
                  <span style={{ fontSize:12, color:"var(--w4)" }}>Hiring manager</span>
                  <span style={{ fontSize:12.5, fontWeight:600, color:"var(--w2)" }}>Sarah Chen, VP Product</span>
                </div>
                <div style={{ margin:"16px 0", padding:"13px 14px", borderRadius:9, background:"var(--s2)", border:"1px solid var(--bdr)", fontSize:13, color:"var(--w3)", lineHeight:1.65 }}>
                  "We found your profile and believe your B2B SaaS background fits what we're building. <strong style={{ color:"var(--w2)", fontWeight:500 }}>We'd love to tell you more.</strong>"
                </div>
                <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
                  <button onClick={scrollToForm} style={{ flex:1, padding:"10px 0", borderRadius:9, fontFamily:"inherit", fontSize:13.5, fontWeight:700, background:"var(--w1)", color:"var(--bg)", border:"none", cursor:"pointer", transition:"all .15s" }}
                    onMouseOver={e=>e.currentTarget.style.background="var(--w2)"}
                    onMouseOut={e=>e.currentTarget.style.background="var(--w1)"}>Accept pitch →</button>
                  <button style={{ flex:1, padding:"10px 0", borderRadius:9, fontFamily:"inherit", fontSize:13.5, fontWeight:500, background:"var(--s3)", color:"var(--w3)", border:"1px solid var(--bdr)", cursor:"pointer" }}>Not for me</button>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, padding:"8px 10px", borderRadius:7, background:"var(--s2)", border:"1px solid var(--bdr)", fontSize:11.5, color:"var(--w4)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--w4)" strokeWidth="1.2" strokeLinecap="round">
                    <rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4 5.5V4a2 2 0 014 0v1.5"/>
                  </svg>
                  Your identity stays hidden until you accept
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ══ THE HONEST TRUTH ════════════════════════════ */}
      <section style={{ padding:"100px 40px 120px", background:"var(--bg)", borderTop:"1px solid var(--bdr)" }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }}>

          {/* eyebrow */}
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#4B7BFF", marginBottom:14 }}>
            <div style={{ width:14, height:1, background:"#4B7BFF" }}/>
            The honest truth
          </div>

          {/* section headline */}
          <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)", fontWeight:700, letterSpacing:"-.04em", color:"var(--w1)", lineHeight:1.08, marginBottom:48, maxWidth:640 }}>
            The recruitment industry has been working against you for decades.
          </h2>

          {/* THREE STAT BOXES — same size as four steps, seamless horizontal scroll */}
          <div style={{
            display:"flex",
            flexDirection:"row",
            gap:16,
            marginBottom:72,
            overflowX:"auto",
            WebkitOverflowScrolling:"touch",
            scrollSnapType:"x mandatory",
            paddingBottom:4,
            marginLeft:"-40px",
            marginRight:"-40px",
            paddingLeft:"40px",
            paddingRight:"40px",
            msOverflowStyle:"none",
            scrollbarWidth:"none",
          }}>

            {/* Card 1 — White box, industry stat */}
            <div style={{
              borderRadius:20,
              background:"#E8F0FE",
              padding:"36px 32px",
              display:"flex",
              flexDirection:"column",
              justifyContent:"space-between",
              flex:"0 0 70vw",
              maxWidth:420,
              minHeight:300,
              scrollSnapAlign:"start",
              boxSizing:"border-box",
            }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--w4)" }}>
                Industry Salary Study · 2025
              </div>
              <div style={{ fontSize:"clamp(56px,10vw,80px)", fontWeight:800, letterSpacing:"-.06em", color:"#0A66C2", lineHeight:1 }}>
                75%
              </div>
              <p style={{ fontSize:15, color:"#0A66C2", lineHeight:1.7, opacity:.85 }}>
                of job postings hide salary information — wasting weeks of your life in processes that go nowhere.
              </p>
            </div>

            {/* Card 2 — Greenhouse green, white text */}
            <div style={{
              borderRadius:20,
              background:"#24B662",
              padding:"36px 32px",
              display:"flex",
              flexDirection:"column",
              justifyContent:"space-between",
              flex:"0 0 70vw",
              maxWidth:420,
              minHeight:300,
              scrollSnapAlign:"start",
              boxSizing:"border-box",
            }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.55)" }}>
                Greenhouse Report
              </div>
              <div style={{ fontSize:"clamp(56px,10vw,80px)", fontWeight:800, letterSpacing:"-.06em", color:"#FFFFFF", lineHeight:1 }}>
                60%
              </div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,.9)", lineHeight:1.7 }}>
                of candidates are ghosted after at least one interview stage. No feedback. No explanation. No accountability.
              </p>
            </div>

            {/* Card 3 — Dark box, white text */}
            <div style={{
              borderRadius:20,
              background:"var(--s2)",
              border:"1px solid var(--bdr2)",
              padding:"36px 32px",
              display:"flex",
              flexDirection:"column",
              justifyContent:"space-between",
              flex:"0 0 70vw",
              maxWidth:420,
              minHeight:300,
              scrollSnapAlign:"start",
              boxSizing:"border-box",
            }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--w4)" }}>
                Candor Research · 2026
              </div>
              <div style={{ fontSize:"clamp(56px,10vw,80px)", fontWeight:800, letterSpacing:"-.06em", color:"var(--w1)", lineHeight:1 }}>
                3×
              </div>
              <p style={{ fontSize:15, color:"var(--w3)", lineHeight:1.7 }}>
                more hiring data and analytics available to companies than candidates. The information gap is structural and deliberate.
              </p>
            </div>

          </div>

          {/* EVERY BROKEN THING — headline */}
          <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)", fontWeight:700, letterSpacing:"-.04em", color:"var(--w1)", lineHeight:1.08, marginBottom:24 }}>
            Every broken thing about job hunting. Fixed.
          </h2>

          {/* THE WAY IT WORKS TODAY vs THE CANDOR WAY — stacked */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:80 }}>

            {/* ✕ The way it works today */}
            <div style={{ borderRadius:14, border:"1px solid rgba(248,113,113,.25)", background:"rgba(248,113,113,.08)", overflow:"hidden" }}>
              <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(248,113,113,.20)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(248,113,113,.15)", border:"1px solid rgba(248,113,113,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#F87171" }}>The way it works today</span>
              </div>
              <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                {[
                  "Salary is hidden until after weeks of interviews",
                  "Companies ghost you with zero explanation or consequence",
                  "Your name is judged before your work ever gets a chance",
                ].map((point, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background:"rgba(248,113,113,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1.2 1.2l4.6 4.6M5.8 1.2L1.2 5.8" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </div>
                    <span style={{ fontSize:13.5, color:"var(--w3)", lineHeight:1.55 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Candor way */}
            <div style={{ borderRadius:14, border:"1px solid rgba(35,209,96,.25)", background:"rgba(35,209,96,.08)", overflow:"hidden" }}>
              <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(35,209,96,.20)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(35,209,96,.15)", border:"1px solid rgba(35,209,96,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#23D160" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#23D160" }}>The Candor way</span>
              </div>
              <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                {[
                  "Salary is on the very first message. Always. No exceptions.",
                  "Ghost a candidate and you lose platform access. Permanently.",
                  "Your name is never seen until you choose to reveal it.",
                ].map((point, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background:"rgba(35,209,96,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5l1.8 1.8 3.2-3.2" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize:13.5, color:"var(--w3)", lineHeight:1.55 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FOUR STEPS — Linear-style cards, horizontal scroll snap */}
          <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)", fontWeight:700, letterSpacing:"-.04em", color:"var(--w1)", lineHeight:1.08, marginBottom:8 }}>
            Four steps. Completely simple.
          </h2>
          <p style={{ fontSize:14, color:"var(--w4)", marginBottom:28 }}>
            Each step unlocks the next. By step four the power has shifted completely.
          </p>

          <div style={{
            display:"flex",
            flexDirection:"row",
            gap:16,
            overflowX:"auto",
            WebkitOverflowScrolling:"touch",
            scrollSnapType:"x mandatory",
            paddingBottom:4,
            marginLeft:"-40px",
            marginRight:"-40px",
            paddingLeft:"40px",
            paddingRight:"40px",
            msOverflowStyle:"none",
            scrollbarWidth:"none",
          }}>
            {[
              { n:"01", title:"Tell us who you are",    body:"Your work, not your CV. What you have built and what happened because of it. No keyword stuffing. No ten-page applications." },
              { n:"02", title:"Set your rules",          body:"Minimum salary. Where you will work. What you will never accept. Companies never see your rules — our engine filters them out before they can reach you." },
              { n:"03", title:"The job comes to you",   body:"Companies apply to you with the real salary on the first message, verified culture data, and the hiring manager's name attached." },
              { n:"04", title:"You choose",             body:"Accept, decline, or ask a question first. Your identity stays hidden until you say so. Rate every company. Bad actors lose access permanently." },
            ].map((step, i) => (
              <div key={i} style={{
                borderRadius:20,
                border:"1px solid var(--bdr2)",
                background:"var(--s1)",
                padding:"36px 32px",
                display:"flex",
                flexDirection:"column",
                justifyContent:"space-between",
                flex:"0 0 70vw",
                maxWidth:420,
                minHeight:300,
                scrollSnapAlign:"start",
                boxSizing:"border-box",
                transition:"border-color .18s",
                position:"relative",
                overflow:"hidden",
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = "var(--bdr3)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "var(--bdr2)"}
              >
                {/* large watermark step number */}
                <div style={{
                  position:"absolute", bottom:-20, right:16,
                  fontSize:120, fontWeight:800, letterSpacing:"-.06em",
                  color:"rgba(255,255,255,.03)", lineHeight:1,
                  userSelect:"none", pointerEvents:"none",
                }}>
                  {step.n}
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#4B7BFF" }}>
                    {step.n}
                  </div>
                  {i < 3 && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="var(--w5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize:"clamp(22px,3.5vw,32px)", fontWeight:700, letterSpacing:"-.03em", color:"var(--w1)", lineHeight:1.2, marginBottom:16 }}>
                    {step.title}
                  </div>
                  <p style={{ fontSize:15, color:"var(--w3)", lineHeight:1.7 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding:"140px 40px", background:"var(--bg)", borderTop:"1px solid var(--bdr)", textAlign:"left" }}>
        <div style={{ maxWidth:520 }}>
          <div style={{ width:36, height:2, background:"#4B7BFF", marginBottom:28 }}/>
          <h2 style={{ fontSize:"clamp(32px,4.5vw,54px)", fontWeight:700, letterSpacing:"-.045em", color:"var(--w1)", lineHeight:1.05, marginBottom:14 }}>
            Stop applying.<br/>Start being chosen.
          </h2>
          <p style={{ fontSize:15, color:"var(--w3)", lineHeight:1.65, marginBottom:16 }}>
            {count.toLocaleString()} professionals are already on the list. The higher your position, the earlier you get in. Refer a friend to move up.
          </p>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"8px 16px", borderRadius:100,
            background:"rgba(75,123,255,.10)", border:"1px solid rgba(75,123,255,.25)",
            marginBottom:28,
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4B7BFF", boxShadow:"0 0 8px #4B7BFF", animation:"throb 2.4s ease infinite", flexShrink:0 }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"#4B7BFF" }}>
              Every day you wait, someone else moves ahead of you.
            </span>
          </div>
          {!done ? (
            <>
              <div style={{ display:"inline-flex", background:"var(--s2)", border:"1px solid var(--bdr2)", borderRadius:10, padding:3, marginBottom:14 }}>
                {[{id:"pro",label:"I'm a professional"},{id:"co",label:"I'm a company"}].map(r => (
                  <button key={r.id} onClick={()=>setRole(r.id)} style={{ padding:"7px 18px", borderRadius:8, fontFamily:"inherit", fontSize:13, fontWeight:500, background: role===r.id ? "var(--s5)" : "transparent", color: role===r.id ? "var(--w1)" : "var(--w4)", border:"none", cursor:"pointer", transition:"all .18s" }}>{r.label}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, maxWidth:440 }}>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&join()}
                  placeholder={role==="pro" ? "Your email address" : "Your company email"}
                  style={{ flex:1, padding:"12px 16px", borderRadius:10, border:"1px solid var(--bdr2)", background:"rgba(255,255,255,.03)", fontFamily:"inherit", fontSize:14, color:"var(--w1)", outline:"none", transition:"border-color .18s" }}
                  onFocus={e=>e.target.style.borderColor="var(--bdr3)"}
                  onBlur={e=>e.target.style.borderColor="var(--bdr2)"}
                />
                <button onClick={join} style={{ padding:"12px 22px", borderRadius:10, fontFamily:"inherit", fontSize:14, fontWeight:700, background:"var(--w1)", color:"var(--bg)", border:"none", cursor:"pointer", flexShrink:0, transition:"background .15s" }}
                  onMouseOver={e=>e.currentTarget.style.background="var(--w2)"}
                  onMouseOut={e=>e.currentTarget.style.background="var(--w1)"}>Join →</button>
              </div>
              <p style={{ fontSize:12, color:"var(--w5)", marginTop:12 }}>No spam. No recruiters. Unsubscribe any time.</p>
            </>
          ) : (
            <p style={{ fontSize:15, color:"var(--w2)", fontWeight:500 }}>You are on the list at position #{pos?.toLocaleString()}. Share your link above to move up.</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"var(--s1)", borderTop:"1px solid var(--bdr)", padding:"32px 40px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Mark size={22}/>
            <span style={{ fontSize:14, fontWeight:600, color:"var(--w1)" }}>Candor</span>
          </div>
          <p style={{ fontSize:12, color:"var(--w5)", marginTop:4 }}>The job comes to you.</p>
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {["About","How it works","For companies","Privacy","Terms"].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:"var(--w5)", textDecoration:"none" }}
              onMouseOver={e=>e.currentTarget.style.color="var(--w2)"}
              onMouseOut={e=>e.currentTarget.style.color="var(--w5)"}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:12, color:"var(--w5)" }}>© 2026 Candor.</p>
      </footer>

    </div>
  );
}
