import React,{useEffect,useState}from'react';
import{createRoot}from'react-dom/client';
import{flushSync}from'react-dom';
import'./styles.css';

const SITE_URL='https://opalshop.in';
const CONTACT_EMAIL='hello@opalshop.in';
const SUPABASE_URL='https://nzmsmdkezzgygmilokwz.supabase.co';
const SUPABASE_KEY='sb_publishable_d_zGXn-S8wPivhd2EKmQPQ_KAL2d5iC';
let supabase:any=null;
let supabasePromise:Promise<any>|null=null;
async function ensureSupabase(){
 if(supabase)return supabase;
 if(!supabasePromise){
  supabasePromise=import('@supabase/supabase-js').then(({createClient})=>{
   supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
   return supabase;
  }).catch(e=>{console.warn('Supabase unavailable',e);return null});
 }
 return supabasePromise;
}
const HERO='https://res.cloudinary.com/wholetv/image/upload/v1790069674/wvvcl7fyntc9uewwoe3z.webp';
const HERO_VIDEO='https://res.cloudinary.com/wholetv/video/upload/q_auto:good,vc_auto/v1790087679/bxtfxreuil7llicuzmhe.mp4';
const stoneImages=['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85'];

// Fail-safe boot: the storefront must never remain an empty #root if a client-side exception occurs.
const BOOT_VERSION='2026-09-24-b';
function showBootError(message:string){
  const root=document.getElementById('root');
  if(!root)return;
  root.innerHTML='<div style="min-height:100vh;display:grid;place-items:center;padding:32px;background:#f5f2ea;color:#171716;font-family:Arial,sans-serif"><div style="max-width:520px;text-align:center"><div style="font:italic 34px Georgia,serif;margin-bottom:16px">Opal</div><h1 style="font:400 30px Georgia,serif;margin:0 0 10px">Loading the collection…</h1><p style="margin:0;color:#777;line-height:1.6">The storefront hit a client-side loading error. Please reload the page.</p></div></div>';
  root.dataset.bootError=message;
}
const stones=[
['Opal',['White','Fire','Crystal','Black','Green']],['Pearl',['Natural']],['Tiger eye',['Natural']],['Cat eye',['Natural']],['Amethyst',['Natural']],['Rock crystal',['Natural']],['Matura Diamond',['Natural']],['Starlite',['Natural']],['Jacinth',['Natural']],['Jargoon',['Natural']],['Malacon',['Natural']],['Emerald',['Vivid Green','Bluish-Green','Yellowish-Green']],['Ruby',['Pigeon Blood','Vivid Red','Purplish-Red','Orangey-Red','Deep Red']],['Lapis Lazuli',['Natural']],['Spinel',['Royal Blue','Nocturnal Sky','Evening Sky','Denim Lapis']],['Moonstone',['Natural']],['Black onyx',['Natural']],['Agate',['Red','Blue','Green','Purple','Yellow + Orange','Black + Gray','White + Brown']]
].map(([name,variants],i)=>({id:i,name,variants}));

const knowledge:any = {
  Opal:{origin:'Australia, Ethiopia, Mexico',story:'Silica-rich water can create opal in cavities and seams.',facts:'Precious opal shows play-of-color from ordered silica structures.',care:'Avoid heat shock and harsh chemicals.'},
  Pearl:{origin:'Japan, Australia, Indonesia, Philippines',story:'Pearls form through layers of nacre.',facts:'Natural and cultured pearls have different growth histories.',care:'Wipe after wear and avoid acids.'},
  'Tiger eye':{origin:'South Africa, Australia, India',story:'Fibrous structure creates chatoyant movement.',facts:'Golden, red and blue material occurs.',care:'Clean gently.'},
  'Cat eye':{origin:'Sri Lanka, India, Brazil',story:'Aligned inclusions can create a cat-eye band.',facts:'Species should be stated clearly.',care:'Protect from abrasion.'},
  Amethyst:{origin:'Brazil, Uruguay, Zambia, Namibia',story:'Purple quartz colored by trace elements.',facts:'Quartz is Mohs 7.',care:'Avoid prolonged strong heat.'},
  'Rock crystal':{origin:'Brazil, Madagascar, Arkansas',story:'Clear colorless quartz.',facts:'Quartz is silicon dioxide.',care:'Avoid scratching.'},
  'Matura Diamond':{origin:'Sri Lanka',story:'Historical trade name requiring specimen verification.',facts:'Use species-level documentation.',care:'Use species-specific care.'},
  Starlite:{origin:'Trade name varies',story:'Uncommon trade-style name.',facts:'Confirm species and treatment.',care:'Follow verified species care.'},
  Jacinth:{origin:'Sri Lanka, Cambodia, Myanmar',story:'Historical name for reddish-orange zircon.',facts:'Modern listing should state species.',care:'Clean gently.'},
  Jargoon:{origin:'Historical trade usage',story:'Historical zircon-related trade term.',facts:'Trade names can be ambiguous.',care:'Species-specific care.'},
  Malacon:{origin:'Multiple historical usages',story:'Historical mineral/trade term.',facts:'Verify mineral and provenance.',care:'Species-specific care.'},
  Emerald:{origin:'Colombia, Zambia, Brazil, Ethiopia',story:'Green beryl colored mainly by chromium or vanadium.',facts:'Treatments should be disclosed.',care:'Avoid ultrasonic cleaning unless professionally cleared.'},
  Ruby:{origin:'Myanmar, Mozambique, Sri Lanka, Madagascar',story:'Red corundum colored mainly by chromium.',facts:'Heat treatment is common and should be disclosed.',care:'Gentle handling for treated or fissured stones.'},
  'Lapis Lazuli':{origin:'Afghanistan, Chile',story:'Rock dominated by lazurite with calcite and pyrite.',facts:'Composition varies.',care:'Avoid acids.'},
  Spinel:{origin:'Myanmar, Sri Lanka, Vietnam, Tanzania',story:'Durable magnesium-aluminum oxide gemstone.',facts:'Distinct species from ruby and sapphire.',care:'Mild soap and water.'},
  Moonstone:{origin:'Sri Lanka, India, Tanzania, Madagascar',story:'Feldspar with adularescence.',facts:'Blue sheen can occur.',care:'Avoid hard impacts and strong heat.'},
  'Black onyx':{origin:'Brazil, Uruguay, India',story:'Commercial black chalcedony or related quartz.',facts:'Color may be enhanced.',care:'Mild soap and water.'},
  Agate:{origin:'Brazil, Uruguay, Botswana, India, Mexico',story:'Layered or banded chalcedony.',facts:'Some vivid colors are dyed.',care:'Mild soap and water.'}
};
function Scene(){return <div className="scene"><img src={HERO} alt="" aria-hidden="true" className="sceneFallback"/></div>}

function readLocal(key:string,fallback:string){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function writeLocal(key:string,value:string){try{localStorage.setItem(key,value)}catch{}}

function App(){
 const[page,setPage]=useState('home');
 const[active,setActive]=useState(stones[0] as any);
 const[query,setQuery]=useState('');
 const[cart,setCart]=useState<any[]>([]);
 const[account,setAccount]=useState<any>(null);
 const[cookie,setCookie]=useState('');
 useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('opal-cart')||'[]'));setAccount(JSON.parse(localStorage.getItem('opal-account')||'null'));setCookie(localStorage.getItem('opal-cookie')||'')}catch{setCart([]);setAccount(null);setCookie('')}},[]);
 useEffect(()=>{try{localStorage.setItem('opal-cart',JSON.stringify(cart))}catch{}},[cart]);
 useEffect(()=>{try{localStorage.setItem('opal-account',JSON.stringify(account))}catch{}},[account]);
 useEffect(()=>{const h=()=>setPage(location.hash.slice(1)||'home');addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);
 const nav=(p:string)=>{setPage(p);location.hash=p==='home'?'':p;window.scrollTo(0,0)};
 const hold=(v:string,i:number)=>{setCart(x=>x.concat([{name:active.name,variant:v,price:1500+i*650,image:stoneImages[(active.id+i)%stoneImages.length]}]));nav('cart')};
 const filtered=stones.filter((s:any)=>String(s.name+' '+s.variants.join(' ')).toLowerCase().includes(query.toLowerCase()));
 return <div className="site">
  <header><button className="logo" onClick={()=>nav('home')}>Opal</button><nav>{['categories','search','about','story','origins','gifts','policies','contact'].map(p=><button key={p} onClick={()=>nav(p)}>{p[0].toUpperCase()+p.slice(1)}</button>)}</nav><div className="headActions">
   <button className="iconBtn" aria-label="Search" onClick={()=>nav('search')}><span className="ico searchIcon"/></button>
   <button className="iconBtn" aria-label="Shopping bag" onClick={()=>nav('cart')}><span className="ico bagIcon"/><em>{cart.length}</em></button>
   <button className="iconBtn" aria-label="Orders" onClick={()=>nav('orders')}><span className="ico orderIcon"/></button>
   <button className="iconBtn" aria-label="Account" onClick={()=>nav('account')}><span className="ico accountIcon"/></button>
  </div></header>
  {page==='home'&&<><section className="hero"><div className="heroScene"><video className="heroVideo" src={HERO_VIDEO} autoPlay muted loop playsInline preload="auto" onCanPlay={e=>{e.currentTarget.muted=true;void e.currentTarget.play().catch(()=>{})}}/><Scene/></div><div className="heroBottom"><span>LOOSE STONES</span><button className="heroExplore" onClick={()=>nav('categories')}>EXPLORE</button><span>SCROLL ↓</span></div></section><section className="stoneHighlights" aria-label="Featured stones">{stones.slice(0,10).map((s:any)=><button className="stoneHighlight" key={s.id} onClick={()=>{setActive(s);nav('product')}}><span className="highlightImageWrap"><img src={stoneImages[s.id%stoneImages.length]} alt={s.name}/></span><span className="highlightName">{s.name}</span></button>)}</section><section className="stoneGrid">{stones.map((s:any)=><button key={s.id} onClick={()=>{setActive(s);nav('product')}}><span>{String(s.id+1).padStart(2,'0')}</span><img className="gridStoneImage" src={stoneImages[s.id%stoneImages.length]} alt={s.name}/><strong>{s.name}</strong><small>{s.variants.join(' · ')}</small></button>)}</section></>}
  {page==='categories'&&<Page title="Categories" kicker="COLLECTION"><div className="categoryList">{stones.map((s:any)=><button key={s.id} onClick={()=>{setActive(s);nav('product')}}><span>{String(s.id+1).padStart(2,'0')}</span><strong>{s.name}</strong><em>{s.variants.length} colours</em><b>↗</b></button>)}</div></Page>}
  {page==='search'&&<Page title="Search" kicker="FIND A STONE"><div className="searchPage"><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a stone or colour"/><div className="results">{filtered.map((s:any)=><button key={s.id} onClick={()=>{setActive(s);nav('product')}}><strong>{s.name}</strong><span>{s.variants.join(' · ')}</span></button>)}</div></div></Page>}
  {page==='product'&&<Product active={active} onHold={hold} onNav={nav}/>}
  {page==='origins'&&<Origins onSelect={(s:any)=>{setActive(s);nav('product')}}/>}
  {page==='story'&&<Story onNav={nav}/>}
  {page==='about'&&<About onNav={nav}/>}
  {page==='gifts'&&<Gifts onNav={nav}/>} 
  {page==='policies'&&<Policies onNav={nav}/>} 
  {page==='contact'&&<Contact/>}
  {page==='orders'&&<Orders/>}
  {page==='cart'&&<Cart items={cart} onBack={()=>nav('checkout')} onRemove={i=>setCart(x=>x.filter((_,j)=>j!==i))}/>}
  {page==='checkout'&&<Checkout items={cart} onDone={()=>{setCart([]);nav('order-confirmed')}}/>}
  {page==='order-confirmed'&&<Page title="Order confirmed" kicker="OPAL"><div className="confirmation"><h2>Order received.</h2><button className="darkBtn" onClick={()=>nav('account')}>View account</button></div></Page>}
  {page==='account'&&<Account account={account} setAccount={setAccount}/>}
  {cookie!=='accepted'&&cookie!=='rejected'&&<CookieBanner onChoice={v=>{localStorage.setItem('opal-cookie',v);setCookie(v)}}/>}
 
  <Footer onNav={nav}/></div>
}

function Product({active,onHold,onNav}:{active:any,onHold:(v:string,i:number)=>void,onNav:(p:string)=>void}){const k=knowledge[active.name]||knowledge.Opal;return <Page title={active.name} kicker="SPECIMEN"><div className="product"><div><div className="productVisual"><img className="realStoneImage" src={stoneImages[active.id%stoneImages.length]} alt={active.name}/></div><div className="sourceChips"><button onClick={()=>onNav('origins')}>Origin →</button><button onClick={()=>onNav('story')}>Method →</button><button onClick={()=>onNav('policies')}>Treatment →</button></div></div><div className="productInfo"><span className="mini">COLORS / VARIANTS</span>{active.variants.map((v:string,i:number)=><button key={v} onClick={()=>onHold(v,i)}><span className="swatch"><img src={stoneImages[(active.id+i)%stoneImages.length]} alt=""/></span><span>{v}</span><b>₹{1500+i*650}</b><em>Hold</em></button>)}<div className="detailCards"><div><span className="mini">ORIGIN</span><p>{k.origin}</p></div><div><span className="mini">ABOUT</span><p>{k.story}</p></div><div><span className="mini">FACTS</span><p>{k.facts}</p></div><div><span className="mini">CARE</span><p>{k.care}</p></div></div></div></div></Page>}

function LongEditorial({kicker,title,intro,sections,images,onNav}:{kicker:string,title:string,intro:string,sections:{eyebrow:string,heading:string,body:string,image:number,side?:boolean}[],images?:number[],onNav?:(p:string)=>void}){const pool=images||[0,1,2,3];return <Page title={title} kicker={kicker}><div className="megaPage"><section className="megaLead"><div><span className="mini">{kicker}</span><h2>{intro}</h2></div><Scene/></section>{sections.map((s,i)=><section className={'megaSection '+(s.side?'megaSectionSide':'')} key={s.eyebrow}><div className="megaText"><span className="mini">{s.eyebrow}</span><h3>{s.heading}</h3><p>{s.body}</p>{onNav&&i===sections.length-1&&<button className="darkBtn" onClick={()=>onNav('categories')}>Explore the collection</button>}</div><div className="megaArt"><img src={stoneImages[pool[i%pool.length]]} alt={s.heading}/></div></section>)}</div></Page>}

function Origins({onSelect}:{onSelect:(s:any)=>void}){const sections=[['01 / SOURCE','Where a stone begins','Brazil, Uruguay, Colombia and other South American localities contribute important gemstone material. Provenance should be attached to the actual specimen when available.'],['02 / AFRICA','Color shaped by geology','Ethiopia, Zambia, Mozambique, Tanzania and Madagascar are represented in modern gemstone trade. Source alone does not identify a specimen.'],['03 / SOUTH ASIA','Historic gem routes','Sri Lanka, India and Afghanistan have long histories in gemstone material and trading routes. Documentation keeps the story specific.'],['04 / AUSTRALIA & PACIFIC','Landscape to collection','Australia and nearby regions are especially important to opal and cultured-pearl stories, while provenance remains specimen-specific.'],['05 / SOUTHEAST ASIA','Mineral provinces','Myanmar, Vietnam and Cambodia are associated with varied gemstone deposits and historic production.'],['06 / DOCUMENTATION','Trace what is known','Record mine, region, locality, treatment and supporting paperwork separately; never turn a broad country reference into a false exact origin.']];return <LongEditorial kicker="PROVENANCE" title="Origins" intro="Every stone carries a place, but the place must be documented honestly." sections={sections.map((x,i)=>({eyebrow:x[0],heading:x[1],body:x[2],image:i%4,side:i%2===1}))} images={[0,3,1,2]} onNav={()=>onSelect(stones[0])}/>}

function Story({onNav}:{onNav:(p:string)=>void}){const sections=[['01 / IDENTITY','Name the material','Start with species, variety, color and transparency. Trade names can be useful but should never replace mineral identification.'],['02 / COLOR','See the structure','Play-of-color, chatoyancy, adularescence and banding come from physical structures inside the material.'],['03 / TREATMENT','Say what changed','Heat, dye, filling, fracture treatment and other processes can affect appearance and value and should be disclosed.'],['04 / CUT','Light becomes form','Cutting changes windowing, brilliance, face-up color and the way a stone handles light.'],['05 / PROVENANCE','Keep the trail visible','Origin notes, invoices, laboratory reports and chain-of-custody records help keep a specimen story concrete.'],['06 / CARE','Preserve the material','Care depends on species, treatments and inclusions; use conservative cleaning and storage choices.']];return <LongEditorial kicker="THE OPAL STORY" title="Story" intro="The object is small. The information around it should be deep." sections={sections.map((x,i)=>({eyebrow:x[0],heading:x[1],body:x[2],image:i%4,side:i%2===0}))} onNav={onNav}/>}

function About({onNav}:{onNav:(p:string)=>void}){const sections=[['01 / PURPOSE','A stone-first house','Opal is designed around loose stones rather than finished jewelry. The catalogue gives material history its own space.'],['02 / METHOD','Document before decoration','A clean white interface keeps images, locality, treatment and care notes readable instead of burying them under effects.'],['03 / COLLECTION','Long-form discovery','Each subject page is intentionally deep, with multiple chapters, specimen images and links that keep browsing continuous.'],['04 / TRUST','Clear language','Known facts, general reference and specimen-specific claims should be separated so the reader can tell what is actually documented.'],['05 / EXPERIENCE','Quiet 2.5D motion','Soft depth, floating objects and gentle movement add dimension without a decorative background or neon treatment.'],['06 / FUTURE','A living catalogue','As real specimens are added, their images and documentation can replace generic editorial references without changing the page structure.']];return <LongEditorial kicker="OPAL" title="About" intro="A digital stone house built around material, provenance and calm discovery." sections={sections.map((x,i)=>({eyebrow:x[0],heading:x[1],body:x[2],image:(i+1)%4,side:i%2===1}))} onNav={onNav}/>}

function Contact(){const sections=[['01 / REACH US','A direct line','Questions about a specimen, documentation or a hold should be easy to start.'],['02 / SPECIMENS','Ask before you buy','Reference the stone name, variant and any documentation you have so the conversation stays specific.'],['03 / SOURCING','Talk provenance','Origin questions should distinguish country, region, locality, mine and actual specimen evidence.'],['04 / SUPPORT','Orders and holds','For cart, hold and account questions, keep the selected specimen details ready.'],['05 / PRIVACY','Use the minimum','Share only the contact and order details needed to respond to the request.'],['06 / RESPONSE','A thoughtful reply','The contact page is designed as a long-form doorway into the same documented stone system.']];return <Page title="Contact" kicker="CONTACT"><div className="contactPage"><LongEditorial kicker="CONTACT" title="Contact" intro="A considered place to begin a conversation about a stone." sections={sections.map((x,i)=>({eyebrow:x[0],heading:x[1],body:x[2],image:(i+2)%4,side:i%2===0}))}/><div className="contactCard"><span className="mini">DIRECT CONTACT</span><h3>{CONTACT_EMAIL}</h3><p>For specimen questions, documentation, holds and order support.</p><a className="darkBtn contactMail" href={`mailto:${CONTACT_EMAIL}`}>Email Opal</a><a className="contactDomain" href={SITE_URL}>opalshop.in</a></div></div></Page>}

function Gifts({onNav}:{onNav:(p:string)=>void}){const picks=[stones[0],stones[11],stones[12],stones[14],stones[16]];return <Page title="Gifts" kicker="GIFTING"><div className="megaPage"><section className="megaLead"><div><span className="mini">A GIFT WITH A STORY</span><h2>Choose by color, place and character.</h2></div><Scene/></section><div className="giftCards">{picks.map((s:any,i:number)=><button key={s.id} onClick={()=>{onNav('product')}}><img src={stoneImages[i%stoneImages.length]} alt={s.name}/><span className="mini">{s.name.toUpperCase()}</span><strong>{s.variants[0]}</strong><em>View specimen →</em></button>)}</div>{[1,2,3,4,5].map((n)=><section className="giftLong" key={n}><div><span className="mini">CHAPTER 0{n}</span><h3>{['Choose by color','Choose by locality','Choose by character','Pair with a story','The final selection'][n-1]}</h3><p>Each chapter gives the gift journey a little more room: what the recipient may notice, what the material means, how the specimen can be documented, and how the selection connects back to the main collection.</p></div><img src={stoneImages[n%4]} alt="Gift editorial"/></section>)}</div></Page>}

function Policies({onNav}:{onNav:(p:string)=>void}){const sections=[['01 / LISTINGS','What should be visible','Species, variety, locality, treatment notes and available documentation belong close to the specimen.'],['02 / HOLDS','A reserve, not a payment','A hold marks the selected specimen while the rest of the order flow remains separate.'],['03 / ORDERS','Keep the details together','Cart and checkout steps should preserve the stone name, chosen variant and quoted amount.'],['04 / CARE','Species-specific handling','Cleaning and storage should follow the actual species and any disclosed treatment.'],['05 / PRIVACY','Minimal information','Only the information required for account, contact and order handling should be used.'],['06 / CHANGES','Pages can evolve','As actual specimens and documentation are connected, product facts should be updated without changing the core page structure.']];return <LongEditorial kicker="CLARITY" title="Policies" intro="Clarity is part of the product." sections={sections.map((x,i)=>({eyebrow:x[0],heading:x[1],body:x[2],image:i%4,side:i%2===1}))} onNav={onNav}/>}

function Orders(){const[orders,setOrders]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[message,setMessage]=useState('');useEffect(()=>{(async()=>{const client=await ensureSupabase();if(!client){setMessage('Auth is unavailable.');setLoading(false);return}const{data:{user}}=await client.auth.getUser();if(!user){setMessage('Sign in to view your orders.');setLoading(false);return}const{data,error}=await client.from('opal_orders').select('id,status,payment_status,total,currency,created_at,opal_order_items(product_name,variant_name,quantity,line_total)').eq('user_id',user.id).order('created_at',{ascending:false});if(error)setMessage(error.message);setOrders(data||[]);setLoading(false)})()},[]);return <Page title="Orders" kicker="ACCOUNT"><div className="ordersPage"><div className="orderIntro"><span className="mini">ORDER HISTORY</span><h2>Your recent activity.</h2><p>Live orders and their current status are loaded from Opal.</p></div>{message&&<p className="authMessage">{message}</p>}{loading?<div className="emptyState"><h3>Loading orders…</h3></div>:orders.length?<div className="orderList">{orders.map((o:any)=><div className="orderCard" key={o.id}><div><span className="mini">{String(o.status).toUpperCase()}</span><h3>Order {o.id.slice(0,8)}</h3><p>{new Date(o.created_at).toLocaleString('en-IN')} · {o.payment_status} · ₹{Number(o.total).toLocaleString('en-IN')}</p>{(o.opal_order_items||[]).map((x:any)=><p key={x.product_name+x.variant_name}>{x.product_name} · {x.variant_name} × {x.quantity}</p>)}</div></div>)}</div>:<div className="emptyState"><h3>No orders yet.</h3></div>}</div></Page>}
function Account({account,setAccount}:{account:any,setAccount:(x:any)=>void}){const[email,setEmail]=useState(account?.email||'');const[otp,setOtp]=useState('');const[name,setName]=useState(account?.name||'');const[mode,setMode]=useState(account?'profile':'signin');const[message,setMessage]=useState('');const[sending,setSending]=useState(false);const[verifying,setVerifying]=useState(false);
const sendOtp=async()=>{if(sending)return;setMessage('');if(!email||!email.includes('@')){setMessage('Enter a valid email.');return}setSending(true);try{const client=await ensureSupabase();if(!client){setMessage('Auth is unavailable.');return}const{error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)setMessage(error.message);else setMode('otp')}catch(e){setMessage(e instanceof Error?e.message:'Could not send OTP.')}finally{setSending(false)}};
const verify=async()=>{if(verifying)return;setMessage('');if(!/^\\d{6}$/.test(otp)){setMessage('Enter the verification code.');return}setVerifying(true);try{const client=await ensureSupabase();if(!client){setMessage('Auth is unavailable.');return}const{data,error}=await client.auth.verifyOtp({email,token:otp,type:'email'});if(error){setMessage(error.message);return}const u={email:data.user?.email||email,name:name||data.user?.user_metadata?.name||'Opal customer'};setAccount(u);setMode('profile')}catch(e){setMessage(e instanceof Error?e.message:'Could not verify OTP.')}finally{setVerifying(false)}};
return <Page title="Account" kicker={mode==='otp'?'VERIFY EMAIL':'OPAL'}><div className="accountPage">{mode==='signin'&&<div className="authCard"><h2>Sign in</h2><Field label="EMAIL" value={email} onChange={setEmail} placeholder="you@example.com"/>{message&&<p className="authMessage">{message}</p>}<button className="darkBtn" onClick={sendOtp} disabled={sending}>{sending?'Sending…':'Send OTP'}</button></div>}{mode==='otp'&&<div className="authCard"><h2>Verify email</h2><Field label="OTP" value={otp} onChange={setOtp} placeholder="6-digit code"/>{message&&<p className="authMessage">{message}</p>}<div className="authActions"><button className="darkBtn" onClick={verify} disabled={verifying}>{verifying?'Verifying…':'Verify & continue'}</button><button className="ghost3d" onClick={sendOtp} disabled={sending}>{sending?'Sending…':'Resend OTP'}</button></div></div>}{mode==='profile'&&<div className="accountCards"><div><span className="mini">PROFILE</span><h3>Personal details</h3><Field label="NAME" value={name} onChange={setName}/><Field label="EMAIL" value={email} onChange={setEmail}/><button className="darkBtn" onClick={()=>setAccount({email,name:name||'Opal customer'})}>Save changes</button></div><div><span className="mini">ORDERS</span><h3>Order history</h3><p>Orders, status events and tracking will appear here.</p><button className="ghost3d" onClick={()=>location.hash='orders'}>View orders</button></div></div>}</div></Page>}
function Field({label,value,onChange,placeholder,type='text'}:{label:string,value:string,onChange:(v:string)=>void,placeholder?:string,type?:string}){return <label className="stepField"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} autoComplete="off"/></label>}
function Checkout({items,onDone}:{items:any[],onDone:()=>void}){const[step,setStep]=useState(0);const[message,setMessage]=useState('');const[busy,setBusy]=useState(false);const[data,setData]=useState({email:'',otp:'',name:'',house1:'',house2:'',flat:'',pin:'',district:'',state:'',payment:'cod'});const labels=['Email','Verification','Name','House 1','House 2','Flat / No.','PIN & District','State','Payment','Confirm'];const set=(k:string,v:string)=>setData(d=>({...d,[k]:v}));const total=items.reduce((n,x)=>n+x.price,0);
const sendOtp=async()=>{if(busy)return;setMessage('');if(!data.email.includes('@'))return setMessage('Enter a valid email.');setBusy(true);try{const client=await ensureSupabase();if(!client){setMessage('Auth is unavailable.');return}const{error}=await client.auth.signInWithOtp({email:data.email,options:{shouldCreateUser:true}});if(error)setMessage(error.message);else setStep(1)}catch(e){setMessage(e instanceof Error?e.message:'Could not send OTP.')}finally{setBusy(false)}};
const verify=async()=>{if(busy)return;setMessage('');if(!/^\d{6,8}$/.test(data.otp))return setMessage('Enter the verification code.');setBusy(true);try{const client=await ensureSupabase();if(!client){setMessage('Auth is unavailable.');return}const{error}=await client.auth.verifyOtp({email:data.email,token:data.otp,type:'email'});if(error)setMessage(error.message);else setStep(2)}catch(e){setMessage(e instanceof Error?e.message:'Could not verify OTP.')}finally{setBusy(false)}};
const place=async()=>{if(busy)return;setMessage('');if(!items.length)return setMessage('Your hold is empty.');setBusy(true);try{const client=await ensureSupabase();if(!client){setMessage('Store backend unavailable.');return}const{data:{user}}=await client.auth.getUser();if(!user){setMessage('Please verify your email first.');return}const{data:order,error}=await client.from('opal_orders').insert({user_id:user.id,email:user.email||data.email,customer_name:data.name||'Opal customer',status:'pending',payment_method:data.payment,payment_status:'pending',total,currency:'INR',address:{house1:data.house1,house2:data.house2,flat:data.flat,pin:data.pin,district:data.district,state:data.state}}).select('id').single();if(error||!order){setMessage(error?.message||'Could not create order.');return}const rows:any[]=[];for(const item of items){const{data:p,error:pe}=await client.from('opal_products').select('id').eq('name',item.name).single();if(pe||!p){await client.from('opal_orders').delete().eq('id',order.id);setMessage(pe?.message||'Product not found.');return}const{data:v,error:ve}=await client.from('opal_variants').select('id').eq('product_id',p.id).eq('name',item.variant).single();if(ve||!v){await client.from('opal_orders').delete().eq('id',order.id);setMessage(ve?.message||'Variant not found.');return}rows.push({order_id:order.id,variant_id:v.id,product_name:item.name,variant_name:item.variant,unit_price:item.price,quantity:1})}const{error:itemError}=await client.from('opal_order_items').insert(rows);if(itemError){await client.from('opal_orders').delete().eq('id',order.id);setMessage(itemError.message);return}const mail=await client.functions.invoke('opal-email-v2',{body:{type:'order_received',order_id:order.id}});if(mail.error)console.warn('Order email failed',mail.error);onDone()}catch(e){setMessage(e instanceof Error?e.message:'Could not place order.')}finally{setBusy(false)}};
const next=()=>{if(step===2&&!data.name.trim())return setMessage('Enter your name.');if(step===3&&!data.house1.trim())return setMessage('Enter house/building.');if(step===4&&!data.house2.trim())return setMessage('Enter street/locality.');if(step===5&&!data.flat.trim())return setMessage('Enter flat/floor/plot.');if(step===6&&(!/^\d{6,8}$/.test(data.pin)||!data.district.trim()))return setMessage('Enter a valid 6-digit PIN and district.');if(step===7&&!data.state.trim())return setMessage('Enter your state/region.');setMessage('');setStep(s=>Math.min(s+1,9))};
return <Page title="Checkout" kicker={labels[step].toUpperCase()}><div className="checkoutFlow">{step===0&&<><Field label="EMAIL" value={data.email} onChange={v=>set('email',v)} placeholder="you@example.com"/><button className="darkBtn" onClick={sendOtp} disabled={busy}>{busy?'Sending…':'Send verification OTP'}</button></>}{step===1&&<><Field label="OTP" value={data.otp} onChange={v=>set('otp',v)} placeholder="6-digit code"/><div className="authActions"><button className="darkBtn" onClick={verify} disabled={busy}>{busy?'Verifying…':'Verify email'}</button><button className="ghost3d" onClick={sendOtp} disabled={busy}>{busy?'Sending…':'Resend OTP'}</button></div></>}{step===2&&<Field label="NAME" value={data.name} onChange={v=>set('name',v)} placeholder="Full name"/>}{step===3&&<Field label="HOUSE 1" value={data.house1} onChange={v=>set('house1',v)} placeholder="House / building"/>}{step===4&&<Field label="HOUSE 2" value={data.house2} onChange={v=>set('house2',v)} placeholder="Street / locality"/>}{step===5&&<Field label="FLAT / NO." value={data.flat} onChange={v=>set('flat',v)} placeholder="Flat / floor / plot"/>}{step===6&&<div className="twoFields"><Field label="PIN CODE" value={data.pin} onChange={v=>set('pin',v)} placeholder="PIN"/><Field label="DISTRICT" value={data.district} onChange={v=>set('district',v)} placeholder="District"/></div>}{step===7&&<Field label="STATE" value={data.state} onChange={v=>set('state',v)} placeholder="State / region"/>}{step===8&&<div className="paymentOptions">{[['card','▣','Cards'],['upi','◉','UPI'],['netbanking','⌂','Net banking'],['cod','▤','Cash on delivery']].map(([id,icon,label])=><button className={data.payment===id?'selectedPay':''} key={id} onClick={()=>set('payment',String(id))}><span>{icon}</span><strong>{String(label)}</strong><small>{id==='cod'?'Pay on delivery':'Payment is recorded as pending until a gateway confirms it.'}</small></button>)}</div>}{step===9&&<div className="confirmation"><span className="mini">ORDER CONFIRMATION</span><h2>Ready to place.</h2><p>We'll create a real Opal order record. Online payments remain pending until a payment gateway is connected.</p>{items.map((x,i)=><div className="reviewRow" key={i}><span>{x.name} · {x.variant}</span><b>₹{x.price.toLocaleString('en-IN')}</b></div>)}<div className="reviewTotal"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><button className="darkBtn" onClick={place} disabled={busy}>{busy?'Placing order…':'Confirm order'}</button></div>}{message&&<p className="authMessage">{message}</p>}{step>=2&&step<9&&<button className="darkBtn stepNext" onClick={next} disabled={busy}>{busy?'Please wait…':'Continue'}</button>}</div></Page>}
function CookieBanner({onChoice}:{onChoice:(v:string)=>void}){return <div className="cookieBar" role="dialog" aria-label="Cookie preferences"><div><strong>Privacy choices</strong><p>Opal uses essential local storage for cart, account and cookie preferences. No advertising cookies are required for the storefront.</p></div><div className="cookieActions"><button onClick={()=>onChoice('rejected')}>Decline</button><button className="dark3d" onClick={()=>onChoice('accepted')}>Accept</button></div></div>}

function Footer({onNav}:{onNav:(p:string)=>void}){const links=[['About','about'],['Origins','origins'],['Story','story'],['Gifts','gifts'],['Policies','policies'],['Contact','contact']];return <footer className="siteFooter"><div className="footerBrand"><button className="logo" onClick={()=>onNav('home')}>Opal</button></div><nav className="footerLinks">{links.map(([label,path])=><button key={path} onClick={()=>onNav(path)}>{label}</button>)}</nav></footer>}

function Page({title,kicker,children}:{title:string;kicker:string;children:React.ReactNode}){return <main className="page"><h1>{title}</h1>{children}</main>}

window.addEventListener('error',(e)=>console.error('OPAL runtime error',e.error||e.message));
window.addEventListener('unhandledrejection',(e)=>console.error('OPAL unhandled rejection',e.reason));
window.addEventListener('unhandledrejection',(e)=>console.error('OPAL promise error',e.reason));

const fallback=document.getElementById('opal-static-home');
const revealFallback=()=>{ 
  if(fallback)fallback.removeAttribute('hidden');
  const status=document.getElementById('opal-static-status');
  if(status)status.textContent='Interactive mode could not stay active. The collection remains available in this view.';
};
window.addEventListener('error',revealFallback,true);
window.addEventListener('unhandledrejection',revealFallback,true);

const root=document.getElementById('opal-app')||document.getElementById('root');
if(root){
  try{
    const reactRoot=createRoot(root);
    flushSync(()=>reactRoot.render(<App/>));
    // Do not hide the server-rendered safety screen until the React app has
    // actually produced visible content. This prevents a flash-then-blank
    // screen if React commits and then fails during an effect.
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        try{
          const app=document.getElementById('opal-app');
          const site=app?.querySelector('.site');
          const healthy=!!site && site.textContent?.trim().length>20 && site.getBoundingClientRect().height>100;
          if(healthy){
            if(fallback)fallback.setAttribute('hidden','');
          }else{
            revealFallback();
          }
        }catch(error){
          console.error('OPAL_HEALTHCHECK_ERROR',error);
          revealFallback();
        }
      },900);
    });
  }catch(error){
    console.error('OPAL_BOOT_ERROR',error);
    revealFallback();
  }
}
