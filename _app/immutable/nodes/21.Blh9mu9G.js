import"../chunks/disclose-version.Bg9kRutz.js";import{e as g,g as h,l,i as r,r as s,t as _,s as y,o as k,j as x}from"../chunks/runtime.CwSbfP9F.js";import{e as P,s as S}from"../chunks/render.BfxXu2ce.js";import{i as O}from"../chunks/if.ZcvIpmxW.js";import{a as c,t as f}from"../chunks/template.Dj2c3_OM.js";import{p as j}from"../chunks/event-modifiers.Bfc47y5P.js";import{i as M}from"../chunks/lifecycle.Dpi4XHcX.js";import{p as T}from"../chunks/props.DEpAHq7J.js";import{d as D}from"../chunks/api.CpnLB2Sq.js";import{g as q}from"../chunks/entry.CDBu3P4u.js";import{b as z}from"../chunks/paths.OcXPU7ra.js";async function F({url:e}){return{token:e.searchParams.get("token")}}const U=Object.freeze(Object.defineProperty({__proto__:null,load:F},Symbol.toStringTag,{value:"Module"}));var R=f('<div class="row mt-4"><p><mark> </mark></p></div>'),A=f('<div class="container" style="max-width: 600px"><!> <form class="row mt-4" method="POST"><div class="mb-3"><label for="password" class="form-label">Password</label> <input type="password" class="form-control" id="password" name="password" minlength="10" required aria-describedby="passwordhelp"> <div id="passwordhelp" class="form-text">Minimum of ten characters</div></div> <div class="row mb-3"><div class="col"><button type="submit" class="btn btn-primary">Reset My Password</button></div></div></form></div>');function V(e,n){g(n,!1);let v=T(n,"data",8),o=k();async function b(m){try{const a=new FormData(m.currentTarget),t={token:v().token,password:a.get("password")};await D.post("auth/reset-password",t),await q(z+"/user/login")}catch{x(o,"Oops...something has gone wrong. Please try again later.")}}M();var i=A(),p=r(i);O(p,()=>l(o),m=>{var a=R(),t=r(a),d=r(t),w=r(d);s(d),s(t),s(a),_(()=>S(w,l(o))),c(m,a)});var u=y(p,2);s(i),P("submit",u,j(b)),c(e,i),h()}export{V as component,U as universal};