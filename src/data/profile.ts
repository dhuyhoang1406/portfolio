export const profile = {
  name: "Dang Huy Hoang",
  role: "Full-stack Developer",
  bio: "I build thoughtful interfaces and the systems behind them. My main ecosystem is JavaScript and TypeScript, from React applications to NestJS APIs.",
  githubHandle: "dhuyhoang1406",
  experience: [
    {
      company: "MangoAds",
      role: "Backend Developer Intern",
      period: "Aug 2026 – Present",
      description:
        "Exploring backend architecture and supporting assigned development tasks.",
    },
    {
      company: "Best HR Solution",
      role: "Fullstack Engineer Intern",
      period: "May – Jul 2026",
      description:
        "React, Next.js and NestJS features for an AI recruitment platform.",
    },
  ],
  location: "Ho Chi Minh City, Vietnam",
  education: "Software Engineering, Saigon University",
  email: "dhuyhoang1406@gmail.com",
  github: "https://github.com/dhuyhoang1406",
  linkedin: "https://www.linkedin.com/in/dang-huy-hoang-08507b391/",
  resume: `${import.meta.env.BASE_URL}documents/resume.pdf`,
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "NestJS",
    "ASP.NET Core (.NET 8)",
    "React Native",
    "Flutter",
    "MySQL",
    "SQL Server",
    "MongoDB",
    "Neo4j",
    "Git",
    "Docker",
    "REST APIs",
  ],
  projects: [
    {
      name: "HeritaHub",
      category: "MOBILE · CULTURAL HERITAGE",
      description:
        "A social platform for cultural heritage with real-time chat and maps. NestJS APIs connect a React Native app, with Neo4j supporting heritage relationship queries.",
      stack: "React Native / Expo / NestJS / MySQL / Neo4j",
    },
    {
      name: "EC Project",
      category: "WEB · COMMERCE",
      description:
        "Customer and admin shopping workflows backed by .NET 8 REST APIs. Optimistic locking protects inventory from concurrent overselling.",
      stack: "React / Redux Toolkit / ASP.NET Core / SQL Server",
    },
    {
      name: "LifeHelper",
      category: "BACKEND · PERSONAL AI ASSISTANT",
      description:
        "A personal AI assistant project in development. Implemented a NestJS backend foundation with separate service databases, Clean Architecture, Prisma, Redis and integration testing.",
      stack: "NestJS / PostgreSQL / Prisma / Redis",
      url: "https://github.com/dhuyhoang1406/Lifehelper",
    },
  ],
};
