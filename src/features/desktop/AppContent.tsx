import { profile } from "../../data/profile";
import Music from "./Music";
import Arcade from "./Arcade";
import type { AppId } from "./apps";
export default function AppContent({
  id,
  onOpen,
}: {
  id: AppId;
  onOpen: (id: AppId) => void;
}) {
  switch (id) {
    case "Music":
      return <Music />;
    case "Arcade":
      return <Arcade />;
    case "About Me":
      return (
        <>
          <div className="intro-banner">
            <span>DEVELOPER / BUILDER / CURIOUS MIND</span>
            <i>HCMC ↗</i>
          </div>
          <div className="about-intro">
            <div className="profile-monogram">
              dh<span>✳</span>
            </div>
            <span className="eyebrow">THE PERSON BEHIND THE PIXELS</span>
          </div>
          <h1>
            {profile.name.split(" ").slice(0, -1).join(" ")}
            <br />
            {profile.name.split(" ").at(-1)}
            <span className="accent">.</span>
          </h1>
          <p className="role">{profile.role}</p>
          <p className="about-bio">{profile.bio}</p>
          <div className="profile-stats">
            <div>
              <b>02</b>
              <span>Industry internships</span>
            </div>
            <div>
              <b>03</b>
              <span>Featured projects</span>
            </div>
            <div>
              <b>3.66</b>
              <span>University GPA / 4.00</span>
            </div>
          </div>
          <div className="about-actions">
            <button
              className="primary-action"
              onClick={() => onOpen("Projects")}
            >
              Explore my work <span>↗</span>
            </button>
            <button className="text-action" onClick={() => onOpen("Contact")}>
              Let’s connect →
            </button>
          </div>
          <div className="facts">
            <p>↗ {profile.location}</p>
            <p>▤ {profile.education}</p>
          </div>
          <section className="content-section">
            <span className="eyebrow">A LITTLE MORE ABOUT ME</span>
            <h3>Interfaces are only half the story.</h3>
            <p>{profile.summary}</p>
            <p>
              From a mobile heritage community to an ecommerce platform and a
              personal AI assistant, my projects connect user-facing experiences
              with the services and data behind them.
            </p>
          </section>
          <section className="content-section">
            <span className="eyebrow">HIGHLIGHTS ALONG THE WAY</span>
            <div className="achievement">
              <b>Top 10</b>
              <span>HeritaHub · WebDev Studios competition</span>
            </div>
            <div className="achievement">
              <b>4 semesters</b>
              <span>Academic Merit Scholarships · Saigon University</span>
            </div>
            <div className="achievement">
              <b>705 / 990</b>
              <span>TOEIC Listening & Reading · August 2025</span>
            </div>
          </section>
          <div className="discovery-card">
            <span>Stay a little longer.</span>
            <p>
              Explore the work, put on a soundtrack, or take a quick play break.
            </p>
            <button className="text-action" onClick={() => onOpen("Music")}>
              Open Music ↗
            </button>
            <button className="text-action" onClick={() => onOpen("Arcade")}>
              Visit Arcade ↗
            </button>
          </div>
          <p className="muted">
            Welcome to my little corner of the internet. Open a folder and have
            a look around.
          </p>
          <p className="muted">
            Room:{" "}
            <a
              href="https://sketchfab.com/3d-models/low-poly-room-a6bf7976f3ac401e96907aa5b8a0c1c1"
              target="_blank"
              rel="noreferrer"
            >
              Low Poly Room
            </a>{" "}
            by IsaacTheMaverick ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>
          </p>
        </>
      );
    case "Projects":
      return (
        <>
          <span className="eyebrow">
            SELECTED WORK / 0{profile.projects.length}
          </span>
          <h2>Things I've built</h2>
          <p>
            Three projects across mobile, commerce and backend systems. Open the
            details below to explore my contributions and engineering decisions.
          </p>
          {profile.projects.map((p, i) => (
            <article className="project project-card" key={p.name}>
              <div
                className={`project-art project-art-${i}`}
                aria-hidden="true"
              >
                <span>{i === 0 ? "↗" : i === 1 ? "▧" : "✳"}</span>
                <i />
                <div className="art-caption">
                  <strong>{p.name}</strong>
                  <small>{p.category.split(" · ")[0]}</small>
                </div>
                <b>0{i + 1}</b>
              </div>
              <span className="muted">
                0{i + 1} / {p.category}
              </span>
              <h3>{p.name}</h3>
              <div className="project-meta">
                <span>{p.period}</span>
                <span>{p.team}</span>
              </div>
              <div className="project-highlight">↗ {p.highlight}</div>
              <p>{p.description}</p>
              <div className="architecture-strip">
                {p.architecture.map((layer) => (
                  <span key={layer}>{layer}</span>
                ))}
              </div>
              <h4>My contributions</h4>
              <ul className="contribution-list">
                {p.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <div className="project-stack">
                {p.stack.split(" / ").map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer">
                  View repository ↗
                </a>
              )}
            </article>
          ))}
        </>
      );
    case "Skills":
      return (
        <>
          <span className="eyebrow">MY TOOLBOX</span>
          <h2>
            From interface
            <br />
            to infrastructure.
          </h2>
          <p>Tools I work with across web, mobile and backend projects.</p>
          {profile.skillGroups.map((group, i) => (
            <section className="skill-group" key={group.title}>
              <header>
                <span>0{i + 1}</span>
                <h3>{group.title}</h3>
              </header>
              <p>{group.note}</p>
              <div className="tags">
                {group.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </section>
          ))}
          <div className="discovery-card">
            <span>See the tools in context.</span>
            <p>
              Architecture, database choices and implementation details live in
              the project case studies.
            </p>
            <button className="text-action" onClick={() => onOpen("Projects")}>
              Explore projects ↗
            </button>
          </div>
        </>
      );
    case "Resume":
      return (
        <>
          <span className="eyebrow">EXPERIENCE & EDUCATION</span>
          <h2>
            Always learning.
            <br />
            Always building.
          </h2>
          <div className="resume-summary">
            <span className="eyebrow">PROFILE</span>
            <p>{profile.summary}</p>
            <a
              className="text-action"
              href={profile.resume}
              download="CV_DangHuyHoang.pdf"
            >
              Get the full CV ↓
            </a>
          </div>
          <h3 className="section-title">01 / Industry experience</h3>
          {profile.experience.map((job) => (
            <article className="project experience-card" key={job.company}>
              <h3>{job.company}</h3>
              <p>
                {job.role} · {job.period}
              </p>
              <p>{job.description}</p>
            </article>
          ))}
          <h3 className="section-title">02 / Education & milestones</h3>
          <article className="education-card">
            <h3>Saigon University</h3>
            <p>{profile.educationDetails.degree}</p>
            <span className="eyebrow">{profile.educationDetails.period}</span>
            <div className="achievement">
              <b>{profile.educationDetails.gpa}</b>
              <span>Grade point average</span>
            </div>
            <p>{profile.educationDetails.scholarships}</p>
            <p>{profile.educationDetails.english}</p>
          </article>
          <h3 className="section-title">03 / Project experience</h3>
          {profile.projects.map((p) => (
            <article className="experience-card" key={p.name}>
              <h3>{p.name}</h3>
              <p>
                {p.period} · {p.team}
              </p>
              <p>{p.highlight}</p>
              <button
                className="text-action"
                onClick={() => onOpen("Projects")}
              >
                Read case study ↗
              </button>
            </article>
          ))}
          {profile.resume && (
            <a
              className="action"
              href={profile.resume}
              download="CV_DangHuyHoang.pdf"
            >
              Download resume ↓
            </a>
          )}
        </>
      );
    case "Contact":
      return (
        <>
          <span className="eyebrow">LET'S CONNECT</span>
          <h2>
            Have something
            <br />
            in mind?
          </h2>
          <p>
            Reach out about a project, an opportunity, or just to say hello.
          </p>
          <div className="contact-links">
            <a href={`mailto:${profile.email}`}>
              Email <span>{profile.email} ↗</span>
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub <span>{profile.githubHandle} ↗</span>
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span>{profile.name} ↗</span>
            </a>
          </div>
          <div className="contact-note">
            <span className="eyebrow">GOOD REASONS TO SAY HELLO</span>
            <h3>Projects. Opportunities. Ideas.</h3>
            <p>
              For a development opportunity, include the role and team. For a
              project, tell me what you are building and where you need a hand.
            </p>
            <p>
              Email is a direct way to reach me; GitHub is where you can explore
              the code behind my work.
            </p>
          </div>
          <p className="muted">Based in {profile.location}.</p>
        </>
      );
  }
}
