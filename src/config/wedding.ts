export const wedding = {
  couple: { groom: "Alex", bride: "Claire", groomChinese: "新郎", brideChinese: "新娘" },
  date: { display: "18 · OCT · 2026", chinese: "2026 年 10 月 18 日", iso: "2026-10-18" },
  time: "18:18",
  venue: "THE GARDEN HOTEL",
  ballroom: "GRAND BALLROOM",
  address: "Shanghai",
  latitude: 31.2304,
  longitude: 121.4737,
  invitationText: ["良辰已定，佳期将至。", "诚邀您见证，\n我们人生的新一章。"],
  contact: "如有疑问，请联系新人",
  shareTitle: "Alex & Claire｜Wedding Invitation",
  shareDescription: "2026.10.18 · THE GARDEN HOTEL",
  shareImage: "/share-cover.svg",
  music: "/audio/wedding.mp3",
  photos: [
    { src: "/photos/hero.svg", alt: "Alex 与 Claire 的婚礼影像", position: "center" },
    { src: "/photos/editorial-1.svg", alt: "静谧的婚礼摄影", position: "center" },
    { src: "/photos/editorial-2.svg", alt: "婚礼细节摄影", position: "center" },
  ],
} as const;
export type WeddingConfig = typeof wedding;
