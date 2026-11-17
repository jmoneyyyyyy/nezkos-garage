import {
  GOOGLE_SIGN_IN_BUTTON_TEXT,
  HOW_IT_WORKS_LINK_TEXT,
  LANDING_FINAL_SUBTEXT,
  LANDING_FINAL_TITLE,
  LANDING_HERO_SUBTEXT,
  LANDING_HERO_TITLE,
  LANDING_STEPS,
  LANDING_STEPS_TITLE,
  NEZKOS_GARAGE,
  SIGN_IN_BUTTON_TEXT,
} from "../Constants";
import "./landing.css";

type LandingProps = {
  onSignIn: () => void;
};

function scrollToHowItWorks() {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

function Landing({ onSignIn }: LandingProps) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <span className="landing-brand">{NEZKOS_GARAGE}</span>
        <nav aria-label="Page sections">
          <button className="landing-link" onClick={scrollToHowItWorks}>
            {HOW_IT_WORKS_LINK_TEXT}
          </button>
          <button onClick={onSignIn}>{SIGN_IN_BUTTON_TEXT}</button>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>{LANDING_HERO_TITLE}</h1>
        <p className="landing-lede">{LANDING_HERO_SUBTEXT}</p>
        <button className="landing-cta" onClick={onSignIn}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </button>
      </section>

      <section id="how-it-works" className="landing-section landing-section-alt">
        <h2>{LANDING_STEPS_TITLE}</h2>
        <ol className="landing-steps">
          {LANDING_STEPS.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-final">
        <h2>{LANDING_FINAL_TITLE}</h2>
        <p>{LANDING_FINAL_SUBTEXT}</p>
        <button className="landing-cta" onClick={onSignIn}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </button>
      </section>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} {NEZKOS_GARAGE}
      </footer>
    </main>
  );
}

export default Landing;
