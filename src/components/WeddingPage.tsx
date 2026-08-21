import Image from "next/image";
import { wedding } from "@/config/wedding";
import { RSVPForm } from "./RSVPForm";
import { MusicControl } from "./MusicControl";
import { WeChatBridge } from "./WeChatBridge";
type Guest = { name: string; token: string; partySize: number; rsvp: { attending: boolean; partySize: number; dietary: string | null; message: string | null } | null } | null;
export function WeddingPage({ guest, invalidToken }: { guest: Guest; invalidToken: boolean }) {
 const mapUrl = `https://uri.amap.com/navigation?to=${wedding.longitude},${wedding.latitude},${encodeURIComponent(wedding.venue)}&mode=car&policy=1&src=wedding`;
 return <main>
  <WeChatBridge mapUrl={mapUrl} /><MusicControl src={wedding.music} />
  <section className="hero" aria-labelledby="hero-title"><Image src={wedding.photos[0].src} alt={wedding.photos[0].alt} fill priority sizes="100vw" style={{objectFit:"cover",objectPosition:wedding.photos[0].position}}/><div className="heroShade"/><div className="heroCopy"><p className="kicker">WEDDING INVITATION</p><h1 id="hero-title">{wedding.couple.groom}<i>&amp;</i>{wedding.couple.bride}</h1><p className="date">{wedding.date.display}</p></div></section>
  <section className="invitation reveal"><div>{guest && <p className="dear">Dear {guest.name}</p>}{invalidToken && <p className="tokenNote">邀请链接未识别，您仍可浏览并回执。</p>}<h2>{wedding.invitationText[0]}</h2><p>{guest ? `诚邀您与家人参加我们的婚礼。` : wedding.invitationText[1]}</p></div></section>
  <section className="photoFull reveal"><Image src={wedding.photos[1].src} alt={wedding.photos[1].alt} fill sizes="100vw" style={{objectFit:"cover"}}/></section>
  <section className="details reveal" aria-labelledby="details-title"><p className="sectionNo">01 — THE DAY</p><h2 id="details-title">Wedding<br/>Details</h2><dl><div><dt>DATE</dt><dd>{wedding.date.chinese}</dd></div><div><dt>TIME</dt><dd>{wedding.time}</dd></div><div><dt>VENUE</dt><dd>{wedding.venue}</dd></div><div><dt>BALLROOM</dt><dd>{wedding.ballroom}</dd></div><div><dt>ADDRESS</dt><dd>{wedding.address}</dd></div></dl></section>
  <section className="editorialPhoto reveal"><div className="photoFrame"><Image src={wedding.photos[2].src} alt={wedding.photos[2].alt} fill sizes="(min-width: 800px) 58vw, 86vw" style={{objectFit:"cover"}}/></div><p>Two lives,<br/>one quiet promise.</p></section>
  <section className="location reveal"><p className="sectionNo">02 — LOCATION</p><h2>{wedding.venue}</h2><p>{wedding.ballroom}<br/>{wedding.address}</p><button className="textLink" data-map-url={mapUrl}>导航前往 <span>↗</span></button></section>
  <RSVPForm guest={guest} />
  <footer><p>{wedding.couple.groom} <i>&amp;</i> {wedding.couple.bride}</p><small>WE CANNOT WAIT TO CELEBRATE WITH YOU</small></footer>
 </main>;
}
