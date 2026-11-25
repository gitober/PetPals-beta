import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/privacy.css";

// Details shown on the page. Change these in one place.
const OPERATOR = "Gitta, as a student project"; // who runs the demo
const CONTACT_EMAIL = "petpals045@gmail.com";
const RENDER_REGION = "Frankfurt, Germany";
const ATLAS_REGION = "Amazon Web Services, Stockholm, Sweden";
const LAST_UPDATED = "25 November 2026";

function Privacy() {
  const navigate = useNavigate();

  // "Back to PetPals": return to the page the visitor came from on PetPals.
  // If they opened this page directly, go to the feed when logged in,
  // otherwise to the login page.
  const goBack = () => {
    let cameFromPetPals = false;
    try {
      cameFromPetPals =
        Boolean(document.referrer) &&
        new URL(document.referrer).origin === window.location.origin &&
        window.history.length > 1;
    } catch {
      cameFromPetPals = false;
    }

    if (cameFromPetPals) {
      navigate(-1);
      return;
    }

    let loggedIn = false;
    try {
      loggedIn = Boolean(localStorage.getItem("accessToken"));
    } catch {
      loggedIn = false;
    }
    navigate(loggedIn ? "/home" : "/login");
  };

  return (
    <div className="privacy-page">
      <article className="privacy-card">
        <header className="privacy-header">
          <img src="/img/navbar.png" alt="PetPals logo" className="privacy-logo" />
          <h1>Privacy notice</h1>
          <p className="privacy-updated">PetPals Demo · Last updated {LAST_UPDATED}</p>
          <p className="privacy-summary">
            In short: PetPals Demo only keeps what it needs for you to try it, and deletes your
            demo account and everything you added as soon as you log out, or about an hour after
            you stop using it. No ads, no tracking, nothing is sold.
          </p>
        </header>

        <section>
          <h2>1. Who runs PetPals Demo</h2>
          <p>
            PetPals Demo is a free test version of the PetPals app, run by {OPERATOR}. For any
            question about your data, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>2. What is saved</h2>
          <ul>
            <li>
              <strong>Your demo account.</strong> A random username (like testpal_1234) and a
              random password, stored only in protected form. We never ask for your name or email.
            </li>
            <li>
              <strong>What you add.</strong> Photos, captions, comments, likes, follows, your bio
              and profile picture.
            </li>
            <li>
              <strong>Technical logs.</strong> Like most websites, the server notes each request
              it receives, including your IP address, the time, the page asked for and your browser
              type. These are used to keep the site working and secure.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Why it is saved</h2>
          <p>
            Only to run the demo you chose to try and to keep it secure, which is a legitimate
            interest under the GDPR (Article 6(1)(f)). Your data is not used for advertising,
            profiling or anything else, and it is never sold or shared for marketing.
          </p>
        </section>

        <section>
          <h2>4. How long it is kept</h2>
          <ul>
            <li>
              <strong>When you log out</strong>, your demo account and everything you added,
              including your photos, are deleted straight away.
            </li>
            <li>
              <strong>If you just close the page</strong>, they are deleted automatically about an
              hour after your last activity.
            </li>
            <li>
              <strong>Technical logs</strong> are kept by our hosting provider for a short, limited
              time and then deleted.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Where it is kept and who helps</h2>
          <p>
            Two service providers process data on our behalf, under their own data protection terms.
            Both keep the data in the EU:
          </p>
          <ul>
            <li>
              <strong>Render</strong> hosts the website and its logs ({RENDER_REGION}).
            </li>
            <li>
              <strong>MongoDB Atlas</strong> hosts the database, including your photos (
              {ATLAS_REGION}).
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies and browser storage</h2>
          <p>
            PetPals Demo uses one cookie to keep you logged in, and your browser&apos;s own storage
            for your login and demo checklist. All of it is needed for the demo to work, and the
            login data is removed when you log out. There are no advertising or analytics cookies,
            so there is no cookie banner.
          </p>
        </section>

        <section>
          <h2>7. Your rights</h2>
          <p>
            You can ask to see, correct or delete your data, or object to how it is used. The
            quickest way to delete everything is simply to log out. For anything else, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Because demo accounts are
            random and short-lived, it helps to tell us your demo username.
          </p>
          <p>
            You can also complain to the Office of the Data Protection Ombudsman in Finland (
            <a href="https://tietosuoja.fi/en" target="_blank" rel="noopener noreferrer">
              tietosuoja.fi
            </a>
            ) or to the data protection authority where you live.
          </p>
        </section>

        <section>
          <h2>8. Please keep it pet-friendly</h2>
          <p>
            Other testers can see what you post while your demo account exists. Please only upload
            photos of pets, and no pictures of people or anything that shows private information,
            such as addresses or documents. The demo is not meant for children under 13.
          </p>
        </section>

        <section>
          <h2>9. Changes to this notice</h2>
          <p>
            If this notice changes, the new version is posted here with a new date at the top.
          </p>
        </section>

        <footer className="privacy-footer">
          <button type="button" onClick={goBack} className="privacy-button">
            Back to PetPals
          </button>
        </footer>
      </article>
    </div>
  );
}

export default Privacy;
