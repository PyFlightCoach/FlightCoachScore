import{g as ye}from"../chunks/index.ClTKiXCz.js";import{a as xe}from"../chunks/analysis.Dc8TT14m.js";import{s as oe,a as we}from"../chunks/analysis.DdsEFb_0.js";import"../chunks/disclose-version.Bg9kRutz.js";import{e as se,m as H,n as re,l as e,g as le,o as $,j as h,v as q,f as z,t as l,i as a,s as c,r as t,ad as $e}from"../chunks/runtime.CwSbfP9F.js";import{s as n,e as je}from"../chunks/render.BfxXu2ce.js";import{i as Y}from"../chunks/if.ZcvIpmxW.js";import{e as Z,i as ee}from"../chunks/each.BdGor9y4.js";import{c as te,a as p,t as j}from"../chunks/template.Dj2c3_OM.js";import{s as G}from"../chunks/attributes.Dii1APe5.js";import{i as ce}from"../chunks/lifecycle.Dpi4XHcX.js";import{s as Ee,a as ae,c as Me}from"../chunks/store.CQHjRMnn.js";import{p as T}from"../chunks/props.DEpAHq7J.js";import{P as Oe}from"../chunks/Plot.C7q7TIXp.js";import{l as Pe,r as k}from"../chunks/layouts.BUGwDvF0.js";import{d as B}from"../chunks/styling.P309WQS-.js";async function Fe(){await xe(ye(oe))}const Ye=Object.freeze(Object.defineProperty({__proto__:null,load:Fe},Symbol.toStringTag,{value:"Module"}));function De(E,v){se(v,!1);const m=$();let u=T(v,"sts",8),o=T(v,"activeEls",8,null),i=T(v,"sp",8,3);H(()=>(q(u()),q(o()),q(i()),B),()=>{h(m,Object.entries(u()).map(([d,s],y)=>{if(o()!=null){let f=null;return o().forEach((b,_)=>{b.includes(d)&&(f=k(s,i(),{},{opacity:.8,showlegend:!1,color:B(_),name:d}))}),f==null&&(f=k(s,i(),{},{opacity:.2,showlegend:!1,color:"grey",name:d})),f}else return k(s,i(),{},{opacity:.2,showlegend:!1,color:B(y),name:d})}))}),re(),ce(),Oe(E,{get data(){return e(m)},layout:Pe,fillParent:!0}),le()}var Ie=j('<tr><td style="overflow:hidden; text-overflow:ellipsis; white-space: nowrap;"> </td><td> </td><td> </td><td> </td><td> </td></tr>'),Ce=j('<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" aria-expanded="false"> </button></h2> <div class="accordion-collapse collapse" data-bs-parent="#interAccordion"><div class="accordion-body"><div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th scope="col" class="col-3 overflow-scroll">Collector</th><th scope="col" class="col-1">Value</th><th scope="col" class="col-1">Error</th><th scope="col" class="col-1">Visibility</th><th scope="col" class="col-1">DownGrade</th></tr></thead><tbody><!></tbody></table></div></div></div></div>'),Ve=j('<div class="col-4 pt-3 border"> <accordion class="accordion" id="interAccordion"></accordion></div> <div class="col-8 border"><!></div>',1),Ae=j("<div>no data</div>");function Ze(E,v){se(v,!1);const m=Ee(),u=()=>ae(oe,"$selManID",m),o=()=>ae(e(i),"$man",m),i=$(),d=$();let s=$();H(()=>u(),()=>{Me(h(i,we[u()]),"$man",m)}),H(()=>o(),()=>{h(d,o().flown.split())}),re(),ce();var y=te(),f=z(y);Y(f,()=>o()&&o().scores&&o().mdef,b=>{var _=Ve(),M=z(_),J=a(M),K=c(J);Z(K,5,()=>Object.values(o().scores.inter.data),ee,(x,r)=>{var O=Ce(),P=a(O),g=a(P),ne=a(g);l(()=>n(ne,`${e(r).name??""}, dg = ${e(r).total.toFixed(2)??""}`)),t(g),t(P);var F=c(P,2),N=a(F),Q=a(N),R=a(Q),U=c(a(R)),ve=a(U);Y(ve,()=>e(s)&&e(s).name===e(r).name,D=>{var W=te(),me=z(W);Z(me,1,()=>Object.values(e(s).collectors),ee,(fe,_e,w)=>{var I=Ie(),C=a(I),pe=a(C);t(C);var V=c(C),ue=a(V);l(()=>n(ue,e(r).sample[w].toFixed(2))),t(V);var A=c(V),be=a(A);l(()=>n(be,e(r).errors[w].toFixed(2))),t(A);var S=c(A),ge=a(S);l(()=>n(ge,e(r).measurement.visibility[w].toFixed(2))),t(S);var X=c(S),he=a(X);l(()=>n(he,e(r).dgs[w].toFixed(2))),t(X),t(I),l(()=>n(pe,e(_e))),p(fe,I)}),p(D,W)}),t(U),t(R),t(Q),t(N),t(F),t(O),l(()=>{G(g,"data-bs-target",`#${e(r).name??""}`),G(g,"aria-controls",e(r).name),G(F,"id",e(r).name)}),je("click",g,D=>{D.target.attributes.class.nodeValue.includes("collapsed")?h(s,void 0):h(s,o().mdef.mps[e(r).name])}),p(x,O)}),t(K),t(M);var L=c(M,2),ie=a(L),de=$e(()=>e(s)?e(s).getCollectorEls(Object.keys(o().mdef.eds)):void 0);De(ie,{get sts(){return e(d)},get activeEls(){return e(de)}}),t(L),l(()=>{var x;return n(J,`${(((x=e(s))==null?void 0:x.name)||"no active result")??""} `)}),p(b,_)},b=>{var _=Ae();p(b,_)}),p(E,y),le()}export{Ze as component,Ye as universal};