import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const guests = [
  { token: "TEST001", name: "王先生", groupName: "测试宾客" },
  { token: "TEST002", name: "Alex & Emma", partySize: 2, groupName: "测试宾客" },
  { token: "TEST003", name: "陈女士", groupName: "测试宾客" },
];
await Promise.all(guests.map((guest) => db.guest.upsert({ where: { token: guest.token }, update: guest, create: guest })));
await db.$disconnect();
