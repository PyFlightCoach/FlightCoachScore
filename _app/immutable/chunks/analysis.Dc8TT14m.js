import{C as x,D as _,P as Y,E as G,c as O,o as w,O as ee,b as T,z as m,H as W,S as te,l as se,a as h,w as f,s as re,g as ie,y as D,I as S,B as z,f as I,h as P,e as A,k as L,q as oe,d as ne,t as ae,A as ce}from"./analysis.DdsEFb_0.js";import{S as u}from"./state.CheJn4lH.js";import{a as J}from"./api.CpnLB2Sq.js";import{g as a,w as F}from"./index.ClTKiXCz.js";import{b as le}from"./paths.OcXPU7ra.js";class he{constructor(e,t,s,r,i,n){this.kind=e,this.uid=t,this.speed=s,this.radius=r,this.roll=i,this.ke=n}describe(){return`Loop at ${this.speed.toFixed(0)} m/s with radius ${this.radius.toFixed(0)} m and roll ${(this.roll*180/Math.PI).toFixed(0)}°`}}class ue{constructor(e,t,s,r,i){this.kind=e,this.uid=t,this.speed=s,this.length=r,this.roll=i}describe(){return this.roll==0?`Line at ${this.speed.toFixed(0)} m/s with length ${this.length.toFixed(0)} m`:`${(this.roll*180/Math.PI).toFixed(0)}° roll at ${this.speed.toFixed(0)} m/s and length ${this.length.toFixed(0)} m`}}class de{constructor(e,t,s,r,i,n,c,l){this.kind=e,this.uid=t,this.speed=s,this.length=r,this.roll=i,this.pitch=n,this.break_roll=c,this.recovery_roll=l}describe(){return`${(this.roll*180/Math.PI).toFixed(0)}° snap roll at ${this.speed.toFixed(0)} m/s `}}class me{constructor(e,t,s,r,i,n,c,l){this.kind=e,this.uid=t,this.speed=s,this.height=r,this.turns=i,this.pitch=n,this.drop_turns=c,this.recovery_turns=l}describe(){return`${(this.turns*180/Math.PI).toFixed(0)}° spin at ${this.speed.toFixed(0)} m/s, height ${this.height.toFixed(0)} m`}}class pe{constructor(e,t,s){this.kind=e,this.uid=t,this.yaw_rate=s}describe(){return`Stall turn with yaw rate ${(this.yaw_rate*180/Math.PI).toFixed(0)}°/s`}}class d{constructor(e,t,s){this.elements=e,this.exit_line=t,this.uid=s}static parse(e){return new d(e.elements,e.exit_line,e.uid)}getEl(e){for(let t of this.elements)if(t.uid==e)switch(t.kind){case"Line":return Object.setPrototypeOf(t,ue.prototype);case"Loop":return Object.setPrototypeOf(t,he.prototype);case"Snap":return Object.setPrototypeOf(t,de.prototype);case"Spin":return Object.setPrototypeOf(t,me.prototype);case"StallTurn":return Object.setPrototypeOf(t,pe.prototype)}}elInfo(e){const t=d.remove_ret("scoring",this.getEl(e));function s(r){return typeof r=="number"?r.toFixed(2):String(r)}return Object.entries(t).map(r=>String(r[0])+"="+s(r[1]))}static remove_ret(e,t){let s={};return Object.entries(t).forEach(r=>{r[0]!=e&&(s[r[0]]=r[1])}),s}}class M{constructor(e,t,s,r,i){this.value=e,this.expected=t,this.unit=s,this.direction=r,this.visibility=i}static parse(e){return new M(e.value,e.expected,Object.keys(e).includes("unit")?e.unit:"",Object.values(e.direction).map(t=>new Y(t.x,t.y,t.z)),e.visibility)}}class R{constructor(e,t,s,r,i,n,c,l,E){this.name=e,this.measurement=t,this.sample=s,this.sample_keys=r,this.errors=i,this.dgs=n,this.keys=c,this.total=l,this.criteria=E}static parse(e){let t=e.measurement.constructor==Object?M.parse(e.measurement):e.measurement;return new R(e.name,t,e.sample,e.sample_keys,e.errors,e.dgs,e.keys,e.total,e.criteria)}factoredDG(e){return this.dgs.length==0?0:_(this.dgs.map(t=>e(t)))}scale(){return this.measurement.unit.includes("rad")?180/Math.PI:1}info(){const e=this.scale();return this.keys.map((t,s)=>{let r=this.sample_keys[t];return"measurement = "+(this.measurement.value[r]*e).toFixed(2)+"<br>error = "+(this.errors[s]*e).toFixed(1).toString()+"<br>visibility = "+this.measurement.visibility[r].toFixed(2).toString()+"<br>downgrade = "+this.dgs[s].toFixed(2).toString()})}}class b{constructor(e,t,s,r){this.name=e,this.data=t,this.summary=s,this.total=r}static parse(e){return new b(e.name,x(e.data,R.parse),e.summary,e.total)}factoredDG(e,t=!1){if(Object.values(this.data).length==0)return 0;let s=_(Object.values(this.data).map(r=>r.factoredDG(e)));return t&&(s=Math.floor(s*2)/2),s}}class C{constructor(e,t,s){this.data=e,this.summary=t,this.total=s}static parse(e){return new C(x(e.data,b.parse),e.summary,e.total)}all_fields(){const e=[];return Object.values(this.data).forEach(t=>{Object.values(t.data).forEach(s=>{e.push(s.name)})}),Array.from(new Set(e))}get_downgrades(e="Total"){const t={};return Object.entries(this.data).forEach(([s,r])=>{e=="Total"?t[s]=r.total:e in r.data?t[s]=r.data[e].total:t[s]=0}),t}check_field(e="Total"){const t={};return Object.entries(this.data).forEach(([s,r])=>{e=="Total"||e in r.data?t[s]=!0:t[s]=!1}),t}summaries(){const e={},t=this.all_fields();return Object.entries(this.data).forEach(([s,r])=>{e[s]={},t.forEach(i=>{i in r.data?e[s][i]=r.data[i].total:e[s][i]=null}),e[s].Total=r.total}),e}factoredDG(e,t=!1){return t?_(Object.values(this.data).map(s=>Math.floor(s.factoredDG(e)*2)/2)):_(Object.values(this.data).map(s=>s.factoredDG(e)))}}class ${constructor(e,t,s,r,i){this.inter=e,this.intra=t,this.positioning=s,this.summary=r,this.score=i}static parse(e){return new $(b.parse(e.inter),C.parse(e.intra),b.parse(e.positioning),e.summary,e.score)}}class v{constructor(e,t,s){this.h=e,this.d=t,this.o=s}}class y{constructor(e,t,s,r,i,n,c,l){this.name=e,this.short_name=t,this.k=s,this.position=r,this.start=i,this.end=n,this.centre_points=c,this.centred_els=l}static parse(e){return new y(e.name,e.short_name,e.k,e.position,Object.setPrototypeOf(e.start,v.prototype),Object.setPrototypeOf(e.end,v.prototype),e.centre_points,e.centred_els)}static default(){return new y("new manoeuvre","man",0,"CENTRE",{Kind:"TriangularBox"},new v("BTM","UPWIND","UPRIGHT"),new v("BTM","DRIVEN","DRIVEN"),[],[])}}class j{constructor(e,t,s,r,i){this.name=e,this.criteria=t,this.defaul=s,this.unit=r,this.collectors=i}static parse(e){return new j(e.name,e.criteria,e.defaul,e.unit,e.collectors)}getCollectorEls(e){return Object.values(this.collectors).map(t=>{const s=[],r=t.split(/[^A-Za-z_0-9]/);return e.forEach(i=>{r.includes(i)&&s.push(i)}),s})}}class N{constructor(e,t,s=void 0,r=void 0,i=void 0){this.lookup=e,this.kind=t,this.min_bound=s,this.max_bound=r,this.limit=i}static parse(e){return new N(e.lookup,e.kind,e.min_bound,e.max_bound,e.limit)}}function fe(o){const e=o.split(",");return Object.fromEntries(e.map(t=>{const[s,r]=t.split(":");return[s,Number(r)]}))}class B{constructor(e,t,s,r,i,n){this.name=e,this.measure=t,this.smoothers=s,this.selectors=r,this.criteria=i,this.display_name=n}criteria_description(e){let t=e.scale(),s=e.measurement.unit.replace("rad","°");switch(this.criteria.kind){case"Trough":return`The largest absolute value is downgraded based on its distance below ${(t*this.criteria.limit).toFixed(2)} ${s}.`;case"Peak":return`The largest absolute value is downgraded based on its distance above ${(this.criteria.limit*t).toFixed(2)} ${s}.`;case"Single":return"All values in the sample are downgraded.";case"Limit":return`All values are downgraded based on the distance above ${(this.criteria.limit*t).toFixed(2)} ${s}.`;case"Continuous":return"All peaks in the absolute value of the sample are downgraded based on the distance above the last trough or zero.";case"ContinuousValue":return"All peaks and troughs are downgraded based on the distance from the last peak or trough.";case"Bounded":return`Regions of the sample below ${(this.criteria.min_bound*t).toFixed(2)} ${s} or above ${(this.criteria.max_bound*t).toFixed(2)} ${s} are downgraded.`}}describe_selectors(){let e=!0;const t=this.selectors.reverse().map(s=>{const r=s.match(/^[^(]+/),i=s.match(/\(([^()]+)\)/),n=i?fe(i[1]):{};switch(r[0]){case"before_slowdown":case"after_slowdown":case"after_speedup":case"before_speedup":const c=r[0].includes("before")?"before":"after",l=r[0].includes("speedup")?"increased above":"reduced below";return`${c} the speed has ${l} ${n.sp} m/s`;case"autorot_break":return`before the autorotation has rotated by ${(n.rot*180/Math.PI).toFixed(0)}°.`;case"autorot_recovery":return`during the last ${(n.rot*180/Math.PI).toFixed(0)}° of autorotation`;case"autorotation":return`${(n.brot*180/Math.PI).toFixed(0)}° from the start to ${(n.rrot*180/Math.PI).toFixed(0)}° before the end of the autorotation`;case"before_recovery":return`before the last ${(n.rot*180/Math.PI).toFixed(0)}° of autorotation`;case"first":case"last":case"first_and_last":case"maximum":case"minimum":return e=!1,`${r[0].replaceAll("_"," ")} value`;case"absmax":return e=!1,"maximum absolute value";case"borders":return e=!1,`middle of the sample, with a margin of ${n.tb} seconds`;default:return""}});return`${e?"All values":"The"} ${t.join(" ")}`}static parse(e){return new B(e.name,e.measure,e.smoothers,e.selectors,N.parse(e.criteria),e.display_name)}}class k{constructor(e,t,s,r){this.name=e,this.Kind=t,this.props=s,this.dgs=r}static parse(e){const t=Object.fromEntries(Object.entries(e.dgs).map(([s,r])=>[s,B.parse(r)]));return new k(e.name,e.Kind,e.props,t)}getDG(e){for(const t in this.dgs)if(this.dgs[t].display_name==e||t==e)return this.dgs[t]}}class p{constructor(e,t,s,r,i=null){this.info=e,this.mps=t,this.eds=s,this.box=r,this.options=i}static parse(e){return Array.isArray(e)?new p(y.parse(e[0].info),x(e[0].mps,j.parse),e[0].eds.map(k.parse),e.slice(1).map(p.parse)):new p(y.parse(e.info),x(e.mps,j.parse),Object.fromEntries(Object.entries(e.eds).map(([t,s])=>[t,k.parse(s)])),e.box)}getEd(e){if(e&&this.eds[e])return this.eds[e];for(const t in this.eds)if(e!=null&&e.startsWith(this.eds[t].name))return this.eds[t]}}class g{constructor(e,t,s,r,i,n,c={},l=void 0,E=void 0,V=void 0,H=void 0,q=void 0,Z=void 0,Q=void 0,X=void 0){this.name=e,this.id=t,this.tStart=s,this.tStop=r,this.schedule=i,this.scheduleDirection=n,this.history=c,this.k=l,this.flown=E,this.mdef=V,this.manoeuvre=H,this.template=q,this.corrected=Z,this.corrected_template=Q,this.scores=X}summary(){return{name:this.name,id:this.id,schedule:this.schedule.to_string(),scheduleDirection:this.scheduleDirection,k:this.k}}get_score(e,t,s){var r;return this.history[e]?((r=this.history[e].get_score(t,s))==null?void 0:r.score)||G.empty():G.empty()}async run(e){var t;try{const s=await J.post("analyse_manoeuvre",{name:this.name,category:this.schedule.category,schedule:this.schedule.name,schedule_direction:this.scheduleDirection,flown:((t=this.flown)==null?void 0:t.data)||a(O).slice(this.tStart,this.tStop),origin:a(w)||new ee(0,0,0,0),optimise_alignment:e});return T.set(s.fa_version),m[this.id-1].set(s.info),new g(this.name,this.id,this.tStart,this.tStop,this.schedule,this.scheduleDirection,{...this.history,[s.fa_version]:W.parse(s)},s.mdef.info.k,u.parse(s.flown),p.parse(s.mdef),d.parse(s.manoeuvre),u.parse(s.template),s.corrected?d.parse(s.corrected):void 0,s.corrected_template?u.parse(s.corrected_template):void 0,s.full_scores?$.parse(s.full_scores):void 0)}catch(s){return m[this.id-1].set(`Analysis Failed: ${s.message}`),console.trace(),this}}shortExport(){return{name:this.name,id:this.id,schedule:this.schedule,schedule_direction:this.scheduleDirection,flown:this.flown.data,history:this.history}}longExport(){return{...this.shortExport(),mdef:this.mdef,manoeuvre:this.manoeuvre,template:this.template.data,corrected:this.corrected,corrected_template:this.corrected_template.data,scores:this.scores}}static async parse(e){var t;return m[e.id-1].set(`Analysis Imported at ${new Date().toLocaleTimeString()}`),new g(e.name,e.id,e.flown[0].t,e.flown[e.flown.length-1].t,Object.setPrototypeOf(e.schedule,te.prototype),e.schedule_direction,Object.fromEntries(Object.entries(e.history).map(([s,r])=>[s,W.parse(r)])),((t=e.mdef)==null?void 0:t.info.k)||(await se(e.schedule.category,e.schedule.name))[e.id-1].k,e.flown?u.parse(e.flown):void 0,e.mdef?p.parse(e.mdef):void 0,e.manoeuvre?d.parse(e.manoeuvre):void 0,e.template?u.parse(e.template):void 0,e.corrected?d.parse(e.corrected):void 0,e.corrected_template?u.parse(e.corrected_template):void 0,e.scores?$.parse(e.scores):void 0)}}function be(){return!(!a(D)||!a(A)||!h.every(o=>a(o)&&a(o).scores!==void 0))}function U(o){D.set(o),S.set(new Array(o.length).fill(0)),o.forEach((e,t)=>{h.push(F()),f.push(F(!1)),m.push(F(`Empty Analysis Created At ${new Date().toLocaleTimeString()}`)),h[t].subscribe(s=>{S.update(r=>{var i;return s?r[t]=s.get_score(a(T),a(ne),a(ae)).total*(((i=s.mdef)==null?void 0:i.info.k)|s.k):r[t]=0,r}),z.update(r=>[...new Set([...r,...Object.keys((s==null?void 0:s.history)||[])])]),ce.set(be())})})}function K(){re.set(void 0),ie.set(void 0),D.set(void 0),S.set(void 0),T.set(void 0),z.set([]),O.set(void 0),I.set(void 0),w.set(void 0),P.set(void 0),A.set(void 0),h.length=0,f.length=0,m.length=0}async function je(o,e){const t=[];e.forEach((r,i)=>{r.sinfo&&t.push(i)}),U(t.map(r=>e[r].name)),a(O)&&w.update(r=>Object.assign(r,r.noMove()));let s="Infer";if(a(L)){let r;try{r=await e[t[0]].sinfo.direction_definition()}catch{r={manid:0,direction:"UPWIND"}}const i=o.data[e[r.manid].stop].direction_str();if(r.direction=="DOWNWIND")s=i=="RTOL"?"LTOR":"RTOL";else if(r.direction=="UPWIND")s=i=="RTOL"?"RTOL":"LTOR";else throw new Error(`Invalid direction definition ${r.direction}`)}t.forEach((r,i)=>{var n;h[i].set(new g(e[r].name,i+1,r>0?o.data[e[r-1].stop].t:0,o.data[e[r].stop].t,e[r].sinfo,s,((n=a(P))==null?void 0:n.manhistory(r))||{},a(oe)[e[r].sinfo.to_string()][e[r].id-1].k,a(O)?void 0:new u(o.data.slice(r>0?e[r-1].stop:0,e[r].stop))))})}async function ye(o=!1){var e,t,s;return{origin:a(w),isComp:a(L),sourceBin:((e=a(A))==null?void 0:e.name)||void 0,sourceFCJ:((t=a(P))==null?void 0:t.name)||void 0,bootTime:((s=a(I))==null?void 0:s.toISOString())||void 0,mans:h.map(r=>o?a(r).shortExport():a(r).longExport())}}async function ke(o=!1){return new Blob([JSON.stringify(await ye(o),null,2)],{type:"application/json"})}async function ge(o){K(),w.set(o.origin),L.set(o.isComp),I.set(o.bootTime?new Date(Date.parse(o.bootTime)):void 0),U(o.mans.map(e=>e.name)),o.mans.forEach((e,t)=>{g.parse(e).then(s=>{h[t].set(s)})})}async function Ee(){K(),ge(await(await fetch(`${le}/example/example_analysis.ajson`)).json())}async function Fe(o=!1){h.forEach(async(e,t)=>{await we(t,o)})}async function we(o,e=!1,t=void 0){const s=a(h[o]),r=Object.keys(s.history).includes(await J.get("fa_version"));t===void 0&&(t=!r),(!s.scores||t||e)&&!a(f[o])&&(m[o].set(`Running analysis at ${new Date().toLocaleTimeString()}`),f[o].set(!0),await s.run(t).then(i=>{h[o].set(i),f[o].set(!1)}))}export{g as M,we as a,ye as b,je as c,Fe as d,K as e,ke as f,ge as i,Ee as l};