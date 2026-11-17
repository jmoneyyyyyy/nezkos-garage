import { GOOGLE_SIGN_IN_BUTTON_TEXT } from "../Constants";
import "./landing.css";

type LandingProps = {
  onSignIn: () => void;
};

const STEPS = [
  { title: "Sign in", body: "Use your Google account. No new password to remember." },
  { title: "Add your vehicles", body: "Enter the basics and drop in a photo." },
  { title: "Log your maintenance", body: "Add a service record after every visit to the shop or the driveway." },
];

function scrollToHowItWorks() {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

function Landing({ onSignIn }: LandingProps) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <span className="landing-brand">Nezko's Garage</span>
        <nav aria-label="Page sections">
          <button className="landing-link" onClick={scrollToHowItWorks}>
            How it works
          </button>
          <button onClick={onSignIn}>Sign in</button>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Keep track of your vehicle maintenance.</h1>
        <p className="landing-lede">
          Log every service for the family vehicles in one place, and see what's
          been done and when.
        </p>
        <button className="landing-cta" onClick={onSignIn}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </button>
      </section>

      <section id="how-it-works" className="landing-section landing-section-alt">
        <h2>Up and running in minutes</h2>
        <ol className="landing-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-final">
        <h2>Ready to get organized?</h2>
        <p>Open your garage and start your first log.</p>
        <button className="landing-cta" onClick={onSignIn}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </button>
      </section>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} Nezko's Garage
      </footer>
    </main>
  );
}

export default Landing;
