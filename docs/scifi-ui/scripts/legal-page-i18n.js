(function () {
  'use strict';

  const ROOT = document.documentElement;
  const PATH = location.pathname;
  const SUPPORTED_PATHS = new Set([
    '/scifi-ui/terms.html',
    '/scifi-ui/privacy.html',
    '/scifi-ui/support.html'
  ]);
  if (!SUPPORTED_PATHS.has(PATH)) return;

  const article = document.querySelector('main#main-content .legal-document');
  if (!(article instanceof HTMLElement)) return;

  const originalArticle = article.innerHTML;
  const originalChrome = {
    skip: document.querySelector('.skip-link')?.textContent || '',
    brandSmall: document.querySelector('.brand small')?.textContent || '',
    home: document.querySelector('.legal-home-link')?.textContent || '',
    dark: document.querySelector('[data-theme-choice="dark"]')?.textContent || '',
    light: document.querySelector('[data-theme-choice="light"]')?.textContent || '',
    themeLabel: document.querySelector('.theme-control')?.getAttribute('aria-label') || '',
    brandLabel: document.querySelector('.brand')?.getAttribute('aria-label') || '',
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || ''
  };

  const supportIssueHref = (() => {
    const link = article.querySelector('a[href*="issues"], .support-grid section:nth-child(2) a');
    return link?.getAttribute('href') || '/scifi-ui/support.html';
  })();

  const ENGLISH = {
    '/scifi-ui/terms.html': {
      title: 'Terms of use | FormatX Suite Pro',
      description: 'Terms of use for the FormatX Suite Pro full release, 5-day trial licence, licence purchases and support.',
      brand: 'Terms of use',
      html: `
      <p class="eyebrow">LEGAL INFORMATION · UPDATED 2026-08-07</p>
      <h1>Terms of use and sale</h1>
      <p class="legal-lead">The current official FormatX Suite Pro application, identified from the canonical release metadata, is a <strong>full release</strong>. First use starts with a <strong>5-day trial licence</strong>. The “Stable” evidence designation is a separate public verification gate and is not the same as the commercial full-release status.</p>

      <section>
        <h2>1. Operator and contact</h2>
        <p><strong>Operator and author:</strong> Hutóczky József</p>
        <p><strong>Contact, support and complaints:</strong> <a href="mailto:hutoczky@gmail.com">hutoczky@gmail.com</a></p>
        <p><strong>Website:</strong> https://www.formatxsuite.com</p>
        <p><strong>Legal launch limitation:</strong> public consumer sales can be treated as fully activated only after the operator’s complete postal/registered address, tax number and the exact invoicing-provider details have been published. Until those details are available, checkout must be treated as a business pre-order process.</p>
      </section>

      <section>
        <h2>2. Product and platform status</h2>
        <ul>
          <li>Windows — <strong>Full release</strong>.</li>
          <li>Android — <strong>Full release</strong>.</li>
          <li>Linux / Bazzite — <strong>Full release</strong>, the primary system and long-term support direction.</li>
          <li>Web — <strong>Technical preview</strong>; it does not perform native drive operations.</li>
          <li>macOS — <strong>Planned</strong>; no public native package is available.</li>
          <li>iOS / iPadOS — <strong>Planned</strong>; no public package is available.</li>
        </ul>
        <p>The canonical platform source is <a href="./data/platform-status.json">platform-status.json</a>. The current version, release date and official package URL may come only from the <a href="./data/current-release.json">current-release.json</a> metadata. If that source is unavailable, the interface must not invent a version.</p>
      </section>

      <section>
        <h2>3. Licence and access period</h2>
        <p>The 5-day trial licence is provided to evaluate the complete FormatX application. After the trial expires, continued use requires a paid licence. A paid plan grants a limited, non-exclusive and non-transferable right of use for the selected period, technician count and device allowance.</p>
        <p>The licence does not transfer ownership, copyright, source-code access or distribution rights. The detailed licence is available on the <a href="./license.html">licence page</a>.</p>
      </section>

      <section>
        <h2>4. Contract formation, payment and activation</h2>
        <p>Submitting checkout data constitutes an offer. A contract is formed when the operator confirms the order and the applicable terms in writing.</p>
        <p>Monthly and annual plans are paid by one-time HUF or EUR bank transfer; there is no automatic renewal or recurring card charge.</p>
        <p>A paid licence is activated only after manual verification of the bank credit, currency, amount and order reference. A buyer report by itself is not proof of payment or activation.</p>
      </section>

      <section>
        <h2>5. Invoicing</h2>
        <p>The buyer must provide an accurate billing name, address and, where required, tax number. The invoice may be sent electronically to the supplied email address.</p>
        <p>The exact identity of the invoice issuer and the invoicing service used must be published on this page and in the order confirmation before consumer sales are activated.</p>
      </section>

      <section>
        <h2>6. Withdrawal and immediate digital performance</h2>
        <p>Where the buyer is a consumer, the statutory right of withdrawal applies. Immediate performance of digital content or a digital service during the withdrawal period may begin only after the consumer’s prior express request and acknowledgement that, to the extent provided by law, the right of withdrawal may cease once performance begins or is completed.</p>
        <p>Without that consent, paid access cannot be treated as lawfully supplied immediate consumer digital content. Consumer withdrawal rules do not apply to business buyers.</p>
        <p>Withdrawal notice: <a href="mailto:hutoczky@gmail.com?subject=FormatX%20el%C3%A1ll%C3%A1s">hutoczky@gmail.com</a>. Include the name, order reference, order date and the email address used for confirmation.</p>
      </section>

      <section>
        <h2>7. Refunds and defective performance</h2>
        <ul>
          <li>Before activation, an identifiable payment may be refunded in full.</li>
          <li>Any verified excess from a duplicate or incorrect payment must be refunded.</li>
          <li>If activation fails or cannot materially be completed, the buyer may request correction, replacement performance or, where those are not possible, a refund.</li>
          <li>After activation, statutory withdrawal, conformity and defective-performance rights take precedence over any internal refund policy.</li>
        </ul>
        <p>Send a refund request to the support email address with the reason and order reference. A refund may be returned to the original payment source or to an agreed bank account.</p>
      </section>

      <section>
        <h2>8. Complaints</h2>
        <p>A written complaint may be submitted to <a href="mailto:hutoczky@gmail.com?subject=FormatX%20panasz">hutoczky@gmail.com</a>. Include the complainant’s name, contact details, order reference, a detailed description and the requested action.</p>
        <p>A written consumer complaint must be answered in writing, substantively and in a verifiable manner no later than 30 days after receipt. If the complaint is rejected, the reply must include reasons and information about the competent authority or conciliation body.</p>
      </section>

      <section>
        <h2>9. Safety, compatibility and liability</h2>
        <p>FormatX system-management functions may involve a risk of data loss. The user is responsible for verifying the target, ensuring proper authorisation and creating an independent backup.</p>
        <p>Full release, Technical preview, Development and Planned labels may indicate different platform maturity. Platform status does not replace checking the specific compatibility and test matrix.</p>
        <p>The <a href="./security.html">security model</a> and <a href="./test-matrix.html">test matrix</a> distinguish implemented and publicly verified safety functions from documented requirements.</p>
      </section>

      <section>
        <h2>10. Governing documents</h2>
        <div class="legal-actions">
          <a class="button primary" href="./license.html">Detailed licence</a>
          <a class="button secondary" href="./privacy.html">Privacy</a>
          <a class="button secondary" href="./support.html">Support and complaints</a>
          <a class="button secondary" href="./downloads/">Platform status and downloads</a>
          <a class="button secondary" href="./verification.html">Verification centre</a>
        </div>
      </section>`
    },
    '/scifi-ui/privacy.html': {
      title: 'Privacy notice | FormatX Suite Pro',
      description: 'Privacy information for the FormatX Suite Pro website, support, feedback and bank-transfer licensing flows.',
      brand: 'Privacy',
      html: `
      <p class="eyebrow">PRIVACY NOTICE · UPDATED 2026-08-10</p>
      <h1>Privacy</h1>
      <p class="legal-lead">FormatX does not request or store payment-card numbers, expiry data or CVC codes. Payment is made by HUF or EUR bank transfer. Personal data is processed only for defined purposes.</p>

      <section><h2>1. Data controller</h2><p><strong>Controller:</strong> Hutóczky József</p><p><strong>Contact and data-subject requests:</strong> <a href="mailto:hutoczky@gmail.com">hutoczky@gmail.com</a></p><p><strong>Website:</strong> https://www.formatxsuite.com</p><p>Before full public consumer sales are activated, the controller’s complete postal/registered address and, where legally required, tax and registration details must also be published.</p></section>

      <section><h2>2. Purposes, data and legal bases</h2><ul>
        <li><strong>Order and contract:</strong> company or personal name, contact person, email, billing address, tax number, plan, currency, amount and order reference. Legal basis: steps before entering into a contract and performance of the contract.</li>
        <li><strong>Bank identification and licence activation:</strong> payer name, transaction reference, amount, currency and payment reference. Legal basis: performance of the contract and accounting/legal obligations.</li>
        <li><strong>Invoicing:</strong> billing name, address, tax number and invoice content. Legal basis: legal obligation.</li>
        <li><strong>Support and complaints:</strong> name, email, order or licence identifier, message, attachment and technical environment. Legal basis: performance of a contract, legal obligation or legitimate interest.</li>
        <li><strong>User ratings and feedback:</strong> 1–5 ratings, optional display name, written feedback and contact email, publication consent, timestamp, a one-way network-identifier fingerprint and technical request data. Legal basis: consent and legitimate interest in preventing abuse and improving the service. Only approved ratings are included in the public average; email addresses are never public.</li>
        <li><strong>Security and operational logs:</strong> timestamp, IP address, technical request data and error code. Legal basis: legitimate interest in service security.</li>
        <li><strong>Local settings:</strong> language, theme, intro-viewed state, Organism ON/OFF state and up to 12 Thought Genome fingerprints in browser local storage. A fingerprint does not contain the raw text of the entered question and is not automatically sent to the server.</li>
      </ul></section>

      <section><h2>3. Processors, hosting and recipients</h2><ul>
        <li><strong>Cloudflare, Inc. — hosting, CDN and Worker infrastructure:</strong> 101 Townsend St., San Francisco, CA 94107, USA; contact: <a href="mailto:support@cloudflare.com">support@cloudflare.com</a>. The service may provide web hosting, CDN delivery, Worker execution, security logging and D1 database infrastructure.</li>
        <li><strong>Public source and release infrastructure:</strong> source code, release packages, public issue records and release metadata. Do not submit personal, banking or licence data in a public issue report.</li>
        <li><strong>Google / Gmail:</strong> receiving support, complaint and licence messages.</li>
        <li><strong>QuickChart:</strong> generating QR images when an external service is used instead of the local fallback. The request may also involve technical connection data such as an IP address.</li>
        <li><strong>Banks and payment-service providers:</strong> execution and identification of bank transfers.</li>
        <li><strong>Invoicing provider:</strong> only once invoicing is activated, under the published provider and processor terms.</li>
      </ul><p>This notice must be updated before a new processor is introduced.</p></section>

      <section><h2>4. Retention periods</h2><ul>
        <li><strong>Accounting and invoicing records:</strong> 8 years.</li>
        <li><strong>Completed order and licence records:</strong> 5 years after access ends or until a legal claim can no longer be enforced; the longer mandatory period applies to accounting data.</li>
        <li><strong>Failed or incomplete order session:</strong> up to 30 days.</li>
        <li><strong>Written consumer complaint and response:</strong> 3 years.</li>
        <li><strong>General support correspondence:</strong> 2 years after the case is closed, unless a legal claim or contract requires longer retention.</li>
        <li><strong>User feedback:</strong> a pending or rejected submission is retained for up to 12 months; approved feedback until consent is withdrawn or for up to 3 years. A contact email may be deleted earlier on request.</li>
        <li><strong>Security and debugging logs:</strong> normally 30 days; for a security incident, until the investigation is completed.</li>
        <li><strong>Browser-local settings and Thought Genome fingerprints:</strong> until deleted, browser data is cleared or the user resets them. Thought Genome history can also be deleted separately from the bubble’s advanced controls.</li>
      </ul></section>

      <section><h2>5. QR codes and bank data</h2><p>A QR code may contain the beneficiary’s payment details, fixed amount, currency and order reference. It does not contain payment-card data, passwords or online-banking credentials.</p><p>Before approving any transfer, the buyer must verify the beneficiary, IBAN, amount, currency and payment reference.</p></section>

      <section><h2>6. Automated decision-making and AI</h2><p>FormatX checkout does not make a solely automated licence decision that produces legal effects. Payment and licence activation require manual verification.</p><p>The web Organism thought bubble responds using local rules. This module does not send the question to an external AI service. Thought Genome creates a local technical fingerprint, organ category and timestamp from the question; it does not store the raw question text. After separate permission, read-aloud is performed by the device or browser speech service, which may use a local or online voice depending on the system. Separate verified technical documentation is required for AI data processing in the native application.</p></section>

      <section><h2>7. Data-subject rights</h2><p>A data subject may request access, rectification, erasure or restriction, may object to processing based on legitimate interests and, where applicable, may exercise data portability or withdraw consent.</p><p>Requests: <a href="mailto:hutoczky@gmail.com?subject=FormatX%20adatv%C3%A9delmi%20k%C3%A9relem">hutoczky@gmail.com</a>.</p><p>A data subject may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information and may also seek judicial remedy.</p></section>

      <section><h2>8. Data security</h2><p>Server-side order endpoints may apply access controls, rate limiting, logging and database permissions. Do not submit secrets, licence keys or bank-authentication data in a public issue report.</p></section>

      <div class="legal-actions"><a class="button primary" href="./support.html">Privacy contact</a><a class="button secondary" href="./terms.html">Terms of use</a><a class="button secondary" href="./license.html">Licence</a><a class="button secondary" href="./verification.html">Verification centre</a></div>`
    },
    '/scifi-ui/support.html': {
      title: 'Support and issue reporting | FormatX Suite Pro',
      description: 'FormatX Suite Pro support, issue reporting, complaints, refunds, licensing and evidence-submission routes.',
      brand: 'Support and issue reporting',
      html: `
      <p class="eyebrow">HELP · COMPLAINTS · LICENCE · EVIDENCE</p>
      <h1>Working support channels</h1>
      <p class="legal-lead">The project is operated by a single independent developer. Do not send confidential order, licence, billing, complaint or privacy data through a public issue report.</p>

      <div class="support-grid">
        <section><p class="eyebrow">PRIVATE SUPPORT</p><h2>Email</h2><p>Send order references, licence keys, transaction data or personal data only through a private channel.</p><a class="button primary" href="mailto:hutoczky@gmail.com?subject=FormatX%20t%C3%A1mogat%C3%A1s">Send email</a><p><small>Contact: <strong>hutoczky@gmail.com</strong></small></p></section>
        <section><p class="eyebrow">PUBLIC TECHNICAL ISSUE</p><h2>Public issue report</h2><p>For a reproducible, non-confidential problem, include the platform, official release identifier, hardware, initial state, expected and actual result, and the relevant log.</p><a class="button secondary" href="${supportIssueHref}" target="_blank" rel="noopener noreferrer">Open issue route</a></section>
        <section><p class="eyebrow">COMPLAINTS AND REFUNDS</p><h2>Written handling</h2><p>Include the order reference, the disputed event, the requested remedy and the email address used for confirmation.</p><a class="button secondary" href="mailto:hutoczky@gmail.com?subject=FormatX%20panasz%20vagy%20refund">Request complaint or refund handling</a></section>
      </div>

      <section>
        <h2>Priority and response targets</h2>
        <ul class="check-list">
          <li><strong>P1 – critical:</strong> complete failure of downloading, payment, activation or data security. Target: first substantive response within 1 business day.</li>
          <li><strong>P2 – high:</strong> failure of a main function without a working workaround. Target: first substantive response within 2 business days.</li>
          <li><strong>P3 – normal:</strong> minor issue, documentation problem or improvement proposal. Target: first substantive response within 5 business days.</li>
        </ul>
        <p><small>A response target is not a guaranteed resolution deadline and depends on the current capacity of the one-person project.</small></p>
      </section>

      <section>
        <h2>Required issue-report information</h2>
        <ol class="check-list">
          <li>Platform and canonical status: Full release, Technical preview or Planned; for a separately labelled beta/development channel, include its exact name and version.</li>
          <li>Operating system and exact version.</li>
          <li>The release or build shown in the <a href="./data/current-release.json">canonical release metadata</a>; if no data is available, state that as well.</li>
          <li>Hardware, affected module, initial state and reproduction steps.</li>
          <li>Expected result, actual result, full error message and relevant log.</li>
          <li>Known limitation, workaround and its result.</li>
        </ol>
      </section>

      <section>
        <h2>Submitting evidence</h2>
        <p>For a genuine application capture or test result, include the platform, OS version, hardware, build, date, workflow step and a description of any redaction. Decorative mockups are not accepted into the verification centre as evidence.</p>
      </section>

      <div class="legal-actions">
        <a class="button secondary" href="./downloads/">Downloads and platform status</a>
        <a class="button secondary" href="./verification.html">Verification centre</a>
        <a class="button secondary" href="./test-matrix.html">Test matrix</a>
        <a class="button secondary" href="./known-issues.html">Known issues</a>
        <a class="button secondary" href="./terms.html">Terms of use</a>
        <a class="button secondary" href="./privacy.html">Privacy</a>
      </div>`
    }
  };

  function preferredLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = localStorage.getItem('formatx-language');
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    if (ROOT.lang === 'hu' || ROOT.lang === 'en') return ROOT.lang;
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element && value !== undefined) element.textContent = value;
  }

  function applyChrome(language, page) {
    const english = language === 'en';
    setText('.skip-link', english ? 'Skip to content' : originalChrome.skip);
    setText('.brand small', english ? page.brand : originalChrome.brandSmall);
    setText('.legal-home-link', english ? 'Back to home' : originalChrome.home);
    setText('[data-theme-choice="dark"]', english ? 'Dark' : originalChrome.dark);
    setText('[data-theme-choice="light"]', english ? 'Light' : originalChrome.light);

    const theme = document.querySelector('.theme-control');
    if (theme) theme.setAttribute('aria-label', english ? 'Appearance' : originalChrome.themeLabel);
    const brand = document.querySelector('.brand');
    if (brand) brand.setAttribute('aria-label', english ? 'FormatX Suite Pro home page' : originalChrome.brandLabel);

    document.title = english ? page.title : originalChrome.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = english ? page.description : originalChrome.description;
  }

  function render(language) {
    const page = ENGLISH[PATH];
    if (!page) return;
    if (language === 'en') article.innerHTML = page.html;
    else article.innerHTML = originalArticle;
    applyChrome(language, page);
    ROOT.dataset.fxLegalPageLanguage = language;
    ROOT.dataset.fxLegalPageI18n = 'ready-v1';
  }

  render(preferredLanguage());
  addEventListener('formatx:languagechange', event => {
    const language = event.detail?.language;
    if (language === 'hu' || language === 'en') render(language);
  });
}());
