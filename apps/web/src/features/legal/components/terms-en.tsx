import { CONTACT_EMAIL } from '@/lib/contact-email';

export function TermsEn() {
  return (
    <>
      <p>
        These terms are the rules for using Loopra. By creating an account you agree to them. If you
        have a question, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>1. What Loopra is</h2>
      <p>
        Loopra is a place where riders post group rides and other riders join them. Loopra lists
        rides. It does not organise them. Each ride is organised by the rider who posted it.
      </p>

      <h2>2. Your account</h2>
      <p>You must be 16 or older to have an account.</p>

      <h2>3. Safety</h2>
      <p>You take part in every ride at your own responsibility. When you join or post a ride:</p>
      <ul>
        <li>You take responsibility for yourself and for the group you ride with.</li>
        <li>
          You know and follow the rules of the road. A group ride takes place in live traffic, not
          on a closed course.
        </li>
        <li>
          You come with a roadworthy bike, with brakes, tyres and lights checked before the start.
        </li>
        <li>Riding in a helmet is strongly recommended.</li>
        <li>
          If you are under 18, you need a guardian&apos;s consent and whatever cycling permit your
          country requires.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>Give true information in your account and in the rides you post.</li>
        <li>Do not post rides you do not intend to hold.</li>
        <li>Do not harass, threaten or insult other riders.</li>
        <li>Do not post or upload anything that is illegal or that you have no right to share.</li>
        <li>
          Do not disturb the service, try to get into other accounts, or collect data about other
          riders.
        </li>
      </ul>

      <h2>5. Closing an account</h2>
      <p>
        You can stop using Loopra at any time and ask us to delete your account. We may suspend or
        close an account that breaks these terms.
      </p>

      <h2>6. No warranty</h2>
      <p>
        Loopra is provided as it is. We do not promise that it will always be available or free of
        errors. Rides and routes are posted by riders, and we do not check that they are accurate or
        safe. This does not limit any rights that the law gives you and that cannot be excluded.
      </p>

      <h2>7. Changes to these terms</h2>
      <p>
        We may change these terms. When we do, we update the date at the top of this page. If you
        keep using Loopra after a change, you accept the new terms.
      </p>

      <h2>8. Law and language</h2>
      <p>
        Polish law applies to these terms. They exist in English and in Polish. If the two versions
        differ, the Polish version wins.
      </p>
    </>
  );
}
