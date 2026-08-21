"use client";
import { FormEvent, useState } from "react";
type Guest = { name: string; token: string; partySize: number; rsvp: { attending: boolean; partySize: number; dietary: string | null; message: string | null } | null } | null;
export function RSVPForm({ guest }: { guest: Guest }) {
 const previous = guest?.rsvp; const [attending, setAttending] = useState(previous?.attending ?? true); const [state, setState] = useState<"idle"|"loading"|"success"|"error">("idle"); const [error,setError]=useState("");
 async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if(state==="loading") return; setState("loading"); setError(""); const body=Object.fromEntries(new FormData(event.currentTarget));
  const response=await fetch("/api/rsvp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,attending:body.attending==="yes",partySize:Number(body.partySize),token:guest?.token})}).catch(()=>null);
  if(!response?.ok){setError(response ? ((await response.json().catch(()=>({}))).error||"提交未成功，请稍后重试。") : "网络连接失败，请稍后重试。");setState("error");return;} setState("success");
 }
 return <section className="rsvp reveal" id="rsvp"><p className="sectionNo">03 — R.S.V.P.</p>{state==="success"?<div className="success" role="status"><h2>谢谢你的回复，<br/>期待与你相见。</h2><button className="textLink" onClick={()=>setState("idle")}>修改回执</button></div>:<><h2>Will you<br/>join us?</h2><p className="formIntro">敬请于婚礼前回复，以便我们为您留席。</p><form onSubmit={submit} noValidate>
  <label>姓名<input name="name" required minLength={2} maxLength={40} defaultValue={guest?.name}/></label>
  <fieldset><legend>是否出席</legend><div className="radioRow"><label><input type="radio" name="attending" value="yes" checked={attending} onChange={()=>setAttending(true)}/> 欣然赴约</label><label><input type="radio" name="attending" value="no" checked={!attending} onChange={()=>setAttending(false)}/> 遗憾缺席</label></div></fieldset>
  <label className={!attending?"muted":""}>出席人数<input name="partySize" type="number" inputMode="numeric" min="1" max="20" required={attending} disabled={!attending} defaultValue={previous?.partySize||guest?.partySize||1}/></label>
  <label>饮食忌口 <span>可选</span><input name="dietary" maxLength={200} defaultValue={previous?.dietary||""}/></label>
  <label>留言 <span>可选</span><textarea name="message" rows={3} maxLength={500} defaultValue={previous?.message||""}/></label>
  <input name="website" className="honeypot" tabIndex={-1} autoComplete="off"/><button className="submit" disabled={state==="loading"}>{state==="loading"?"正在提交…":previous?"更新回执":"确认回复"}</button>{error&&<p className="error" role="alert">{error}</p>}
 </form></>}</section>;
}
