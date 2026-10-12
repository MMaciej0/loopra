import { CONTACT_EMAIL } from '@/lib/contact-email';

export function PrivacyPolicyPl() {
  return (
    <>
      <p>
        Ta polityka wyjaśnia, jakie dane osobowe przechowuje Loopra, w jakim celu, kto jeszcze je
        przetwarza i jakie masz prawa.
      </p>

      <h2>1. Kto odpowiada za Twoje dane</h2>
      <p>
        Administratorem danych jest Maciej Mądry, Kraków, Polska. W każdej sprawie dotyczącej Twoich
        danych napisz na adres <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Jakie dane przechowujemy</h2>
      <ul>
        <li>Twój adres e-mail.</li>
        <li>Twoją nazwę użytkownika.</li>
        <li>
          Skrót (hash) Twojego hasła. Samego hasła nigdy nie przechowujemy. Jeśli logujesz się
          wyłącznie przez Google, nie przechowujemy żadnego skrótu hasła.
        </li>
        <li>Informację, czy Twój adres e-mail został potwierdzony.</li>
        <li>Twoje ulubione lokalizacje.</li>
        <li>Jazdy, które utworzyłeś(-aś), i jazdy, do których dołączyłeś(-aś).</li>
        <li>Przesłane przez Ciebie trasy GPX.</li>
        <li>Twój adres IP, który nasz serwer zapisuje w logach przy każdym żądaniu.</li>
      </ul>

      <h2>3. Po co ich używamy</h2>
      <ul>
        <li>
          Aby prowadzić Twoje konto i świadczyć usługę: logowanie, wyświetlanie jazd, tworzenie jazd
          i dołączanie do nich oraz wysyłanie wiadomości e-mail dotyczących konta. Podstawą prawną
          jest umowa między Tobą a nami (art. 6 ust. 1 lit. b RODO).
        </li>
        <li>
          Aby dbać o bezpieczeństwo usługi, na przykład przez ograniczanie liczby żądań w krótkim
          czasie. Podstawą prawną jest nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).
        </li>
      </ul>

      <h2>4. Kto jeszcze przetwarza Twoje dane</h2>
      <p>Korzystamy z usług tych firm. Przetwarzają one dane w naszym imieniu:</p>
      <ul>
        <li>Google — logowanie kontem Google.</li>
        <li>Resend — wysyłanie wiadomości e-mail.</li>
        <li>MapTiler — mapy i wyszukiwanie miejsc.</li>
        <li>Cloudflare R2 — przechowywanie plików.</li>
        <li>Nasz dostawca hostingu — działanie aplikacji i jej bazy danych.</li>
      </ul>

      <h2>5. Pliki cookie i pamięć przeglądarki</h2>
      <p>
        Loopra ustawia wyłącznie pliki cookie niezbędne do działania. Nie używamy analityki ani
        reklamowych plików cookie, dlatego nie wyświetlamy banera cookie.
      </p>
      <ul>
        <li>
          <code>accessToken</code> i <code>refreshToken</code> — utrzymują Twoje zalogowanie.
          Pierwszy jest ważny 15 minut, drugi 30 dni. Oba są usuwane przy wylogowaniu.
        </li>
        <li>
          <code>oauth2-redirect-state</code> — ustawiany na krótki czas podczas logowania przez
          Google, aby zabezpieczyć logowanie.
        </li>
        <li>
          <code>NEXT_LOCALE</code> — zapamiętuje Twój język.
        </li>
        <li>
          <code>sidebar_state</code> — przez 7 dni pamięta, czy menu boczne jest rozwinięte, czy
          zwinięte.
        </li>
      </ul>
      <p>
        Motyw (jasny lub ciemny) nie jest plikiem cookie. Jest zapisany w pamięci lokalnej
        przeglądarki (local storage) pod kluczem <code>theme</code> i nigdy nie trafia na nasz
        serwer.
      </p>

      <h2>6. Twoje prawa</h2>
      <p>Zgodnie z RODO masz prawo do:</p>
      <ul>
        <li>dostępu do swoich danych i otrzymania ich kopii;</li>
        <li>sprostowania nieprawidłowych danych;</li>
        <li>usunięcia danych;</li>
        <li>ograniczenia przetwarzania danych;</li>
        <li>przenoszenia danych;</li>
        <li>sprzeciwu wobec przetwarzania opartego na naszym prawnie uzasadnionym interesie.</li>
      </ul>
      <p>
        Aby skorzystać z tych praw, napisz na adres{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Masz też prawo wnieść skargę do
        polskiego organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (UODO).
      </p>

      <h2>7. Usunięcie konta</h2>
      <p>
        W aplikacji nie ma jeszcze przycisku usuwania konta. Aby usunąć konto, wyślij prośbę na
        adres <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> z adresu e-mail przypisanego
        do konta. Konto usuwamy w ciągu 30 dni.
      </p>
    </>
  );
}
