import { CONTACT_EMAIL } from '@/lib/contact-email';

export function PrivacyPolicyEn() {
  return (
    <>
      <p>
        This policy explains what personal data Loopra stores, why, who else handles it, and what
        rights you have.
      </p>

      <h2>1. Who is responsible for your data</h2>
      <p>
        The data controller is Maciej Mądry, Kraków, Poland. For any question about your data, write
        to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. What we store</h2>
      <ul>
        <li>Your email address.</li>
        <li>Your username.</li>
        <li>
          A hash of your password. We never store the password itself. If you only sign in with
          Google, we store no password hash at all.
        </li>
        <li>Whether your email address has been verified.</li>
        <li>Your favourite locations.</li>
        <li>The rides you created and the rides you joined.</li>
        <li>The GPX routes you uploaded.</li>
        <li>Your IP address, which our server writes to its logs with each request.</li>
      </ul>

      <h2>3. Why we use it</h2>
      <ul>
        <li>
          To run your account and the service: signing you in, showing rides, letting you create and
          join rides, and sending you account email. The legal basis is the contract between you and
          us (Article 6(1)(b) GDPR).
        </li>
        <li>
          To keep the service secure, for example by limiting how many requests can be made in a
          short time. The legal basis is our legitimate interest (Article 6(1)(f) GDPR).
        </li>
      </ul>

      <h2>4. Who else processes your data</h2>
      <p>We use these companies to run Loopra. They process data on our behalf:</p>
      <ul>
        <li>Google — sign-in with a Google account.</li>
        <li>Resend — sending email.</li>
        <li>MapTiler — maps and place search.</li>
        <li>Cloudflare R2 — file storage.</li>
        <li>
          OVHcloud — running the application and its database, on a server in Prague, Czech Republic
          (EU).
        </li>
      </ul>

      <h2>5. Cookies and browser storage</h2>
      <p>
        Loopra sets only the cookies it needs to work. We use no analytics and no advertising
        cookies, which is why there is no cookie banner.
      </p>
      <ul>
        <li>
          <code>accessToken</code> and <code>refreshToken</code> — keep you signed in. The first
          lasts 15 minutes, the second 30 days. Both are removed when you log out.
        </li>
        <li>
          <code>oauth2-redirect-state</code> — set for a short time while you sign in with Google,
          to protect the sign-in.
        </li>
        <li>
          <code>NEXT_LOCALE</code> — remembers your language.
        </li>
        <li>
          <code>sidebar_state</code> — remembers for 7 days whether the side menu is open or
          collapsed.
        </li>
      </ul>
      <p>
        Your theme (light or dark) is not a cookie. It is kept in your browser&apos;s local storage
        under the key <code>theme</code> and is never sent to our server.
      </p>

      <h2>6. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>get access to your data and receive a copy of it;</li>
        <li>have incorrect data corrected;</li>
        <li>have your data deleted;</li>
        <li>have the processing of your data restricted;</li>
        <li>receive your data in a portable format;</li>
        <li>object to processing that is based on our legitimate interest.</li>
      </ul>
      <p>
        To use any of these rights, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        . You also have the right to lodge a complaint with the Polish supervisory authority, the
        President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych,
        UODO).
      </p>

      <h2>7. Deleting your account</h2>
      <p>
        There is no delete button in the app yet. To delete your account, send a request to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the email address of your
        account. We delete the account within 30 days.
      </p>
    </>
  );
}
