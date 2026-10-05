import { profile } from "../../data/profile";
import type { AppId } from "./apps";
export default function AppContent({
  id,
  onOpen,
}: {
  id: AppId;
  onOpen: (id: AppId) => void;
}) {
  switch (id) {
    case "About Me":
      return (
        <>
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
          {profile.projects.map((p, i) => (
            <article className="project project-card" key={p.name}>
              <div
                className={`project-art project-art-${i}`}
                aria-hidden="true"
              >
                <span>{i === 0 ? "↗" : i === 1 ? "▧" : "✳"}</span>
                <i />
                <b>0{i + 1}</b>
              </div>
              <span className="muted">
                0{i + 1} / {p.category}
              </span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
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
          <div className="tags">
            {profile.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
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
          <p>{profile.education}</p>
          {profile.experience.map((job) => (
            <article className="project experience-card" key={job.company}>
              <h3>{job.company}</h3>
              <p>
                {job.role} · {job.period}
              </p>
              <p>{job.description}</p>
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
          <p className="muted">Based in {profile.location}.</p>
        </>
      );
  }
}
