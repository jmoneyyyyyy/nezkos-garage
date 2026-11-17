import { GOOGLE_SIGN_IN_BUTTON_TEXT } from "../Constants";
import "./landing.css";

type LandingProps = {
  onSignIn: () => void;
};

const FEATURES = [
  {
    title: "Every vehicle in one place",
    body: "Add the whole family fleet with year, make, model, mileage and a photo, so each ride has its own card.",
  },
  {
    title: "A full service history",
    body: "Record oil changes, brakes, tires and more with the date, mileage and notes, so you never wonder when it was last done.",
  },
  {
    title: "Private to your family",
    body: "Sign in with Google and your garage is yours. Only the people you add as owners can see a vehicle.",
  },
];

const STEPS = [
  { title: "Sign in", body: "Use your Google account. No new password to remember." },
  { title: "Add your vehicles", body: "Enter the basics and drop in a photo." },
  { title: "Log your maintenance", body: "Add a service record after every visit to the shop or the driveway." },
];

function Landing({ onSignIn }: LandingProps) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <span className="landing-brand">Nezko's Garage</span>
        <nav aria-label="Page sections">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <button onClick={onSignIn}>Sign in</button>
        </nav>
      </header>

      <section className="landing-hero">
        <p className="landing-eyebrow">Family vehicle maintenance log</p>
        <h1>Know exactly when your car was last serviced.</h1>
        <p className="landing-lede">
          Nezko's Garage keeps every vehicle and every service record in one tidy
          place, so oil changes, brakes and tires never slip through the cracks.
        </p>
        <button className="landing-cta" onClick={onSignIn}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </button>
      </section>

      <section id="features" className="landing-section">
        <h2>Built for the family garage</h2>
        <div className="landing-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
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
