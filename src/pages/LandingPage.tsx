import Button from "@mui/material/Button";
import { useAuth } from "../hooks/useAuth";
import {
  GOOGLE_SIGN_IN_BUTTON_TEXT,
  LANDING_FINAL_SUBTEXT,
  LANDING_FINAL_TITLE,
  LANDING_HERO_SUBTEXT,
  LANDING_HERO_TITLE,
  LANDING_STEPS,
  LANDING_STEPS_TITLE,
  NEZKOS_GARAGE,
} from "../Constants";
import "./landing.css";

// The big call-to-action button, used in the hero and at the bottom.
const ctaSx = { mt: 1, px: "28px", py: "14px", fontSize: 17 };

function LandingPage() {
  const { signIn } = useAuth();

  return (
    <main className="landing">
      <section className="landing-hero">
        <h1>{LANDING_HERO_TITLE}</h1>
        <p className="landing-lede">{LANDING_HERO_SUBTEXT}</p>
        <Button variant="contained" onClick={signIn} sx={ctaSx}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </Button>
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
        <Button variant="contained" onClick={signIn} sx={ctaSx}>
          {GOOGLE_SIGN_IN_BUTTON_TEXT}
        </Button>
      </section>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} {NEZKOS_GARAGE}
      </footer>
    </main>
  );
}

export default LandingPage;
