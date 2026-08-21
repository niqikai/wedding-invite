"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { wedding } from "@/config/wedding";

type Guest = {
  id: string;
  token: string;
  name: string;
  partySize: number;
  groupName: string | null;
  note: string | null;
  sentAt: string | null;
  rsvp: { attending: boolean; partySize: number } | null;
};

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV 中没有宾客数据。");
  const headers = lines[0].split(",").map((item) => item.trim().toLowerCase());
  const index = (names: string[]) => headers.findIndex((header) => names.includes(header));
  const nameIndex = index(["name", "姓名"]);
  if (nameIndex < 0) throw new Error("CSV 必须包含 name 或 姓名 列。");
  const sizeIndex = index(["partysize", "邀请人数", "人数"]);
  const groupIndex = index(["group", "groupname", "分组"]);
  const noteIndex = index(["note", "备注"]);
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((item) => item.trim().replace(/^"|"$/g, ""));
    return {
      name: cells[nameIndex],
      partySize: sizeIndex >= 0 ? Number(cells[sizeIndex] || 1) : 1,
      groupName: groupIndex >= 0 ? cells[groupIndex] : "",
      note: noteIndex >= 0 ? cells[noteIndex] : "",
    };
  });
}

export function GuestManager({ guests, siteUrl }: { guests: Guest[]; siteUrl: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const filtered = guests.filter((guest) =>
    `${guest.name} ${guest.groupName || ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  const linkFor = (token: string) => `${siteUrl}/i/${token}`;
  const invitationFor = (guest: Guest) => `${guest.name}，您好：

良辰已定，佳期将至。
诚邀您${guest.partySize > 1 ? "与家人" : ""}参加我们的婚礼。

${wedding.date.chinese} ${wedding.time}
${wedding.venue} · ${wedding.ballroom}

查看邀请并回复：
${linkFor(guest.token)}`;

  async function copy(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function addGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, partySize: Number(data.partySize) }),
    });
    if (!response.ok) {
      setMessage("添加失败，请检查内容后重试。");
      setStatus("error");
      return;
    }
    event.currentTarget.reset();
    setStatus("idle");
    router.refresh();
  }

  async function importCsv(file: File) {
    try {
      setStatus("loading");
      const imported = parseCsv(await file.text());
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guests: imported }),
      });
      if (!response.ok) throw new Error("导入失败，请检查 CSV 内容。");
      setMessage(`已导入 ${imported.length} 个邀请单位。`);
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败。");
      setStatus("error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function toggleSent(guest: Guest) {
    await fetch(`/api/admin/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sent: !guest.sentAt }),
    });
    router.refresh();
  }

  return (
    <section className="adminSection">
      <div className="adminSectionHeading">
        <div><p>01 — INVITATIONS</p><h2>邀请名单</h2></div>
        <button className="secondaryButton" onClick={() => fileRef.current?.click()}>导入 CSV</button>
        <input
          ref={fileRef}
          className="honeypot"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])}
        />
      </div>
      <p className="adminHint">一个邀请单位可以是一位宾客、伴侣或一个家庭。系统会自动生成不可递增的随机专属链接；微信群仍可直接发送首页通用链接。</p>
      <form className="guestForm" onSubmit={addGuest}>
        <label>姓名 / 家庭<input name="name" required maxLength={60} /></label>
        <label>邀请人数<input name="partySize" type="number" min="1" max="20" defaultValue="1" required /></label>
        <label>分组<input name="groupName" maxLength={60} placeholder="例如：男方亲友" /></label>
        <label>备注<input name="note" maxLength={200} /></label>
        <button className="submit" disabled={status === "loading"}>添加并生成链接</button>
      </form>
      {message && <p className={status === "error" ? "error" : "adminNotice"}>{message}</p>}
      <div className="tools"><input aria-label="搜索邀请名单" placeholder="搜索姓名或分组" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="tableScroll">
        <table>
          <thead><tr><th>宾客</th><th>邀请人数</th><th>分组</th><th>回执</th><th>发送状态</th><th>快捷操作</th></tr></thead>
          <tbody>{filtered.map((guest) => (
            <tr key={guest.id}>
              <td><strong>{guest.name}</strong>{guest.note && <small className="cellNote">{guest.note}</small>}</td>
              <td>{guest.partySize}</td><td>{guest.groupName || "—"}</td>
              <td>{guest.rsvp ? (guest.rsvp.attending ? `${guest.rsvp.partySize} 人出席` : "缺席") : "未回复"}</td>
              <td><button className="statusButton" onClick={() => toggleSent(guest)}>{guest.sentAt ? "已发送" : "未发送"}</button></td>
              <td className="rowActions">
                <button onClick={() => copy(linkFor(guest.token), `${guest.id}-link`)}>{copied === `${guest.id}-link` ? "已复制" : "复制链接"}</button>
                <button onClick={() => copy(invitationFor(guest), `${guest.id}-text`)}>{copied === `${guest.id}-text` ? "已复制" : "复制文案"}</button>
                <a href={linkFor(guest.token)} target="_blank" rel="noreferrer">预览</a>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <details className="csvHelp"><summary>CSV 模板与说明</summary><pre>姓名,邀请人数,分组,备注{"\n"}王叔叔一家,3,男方亲友,父亲发送{"\n"}Alex &amp; Emma,2,朋友,新娘发送</pre></details>
    </section>
  );
}
