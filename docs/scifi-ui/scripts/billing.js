(function () {
  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = (apiMeta && apiMeta.content ? apiMeta.content : '/api').replace(/\/$/, '');
  const form = document.getElementById('billing-form');
  const feedback = document.getElementById('billing-feedback');
  const planSelect = document.getElementById('billing-plan');

  if (!form || !feedback || !planSelect) {
    return;
  }

  document.querySelectorAll('.billing-plan-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const planId = trigger.getAttribute('data-plan');
      if (planId) {
        planSelect.value = planId;
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = 'Checkout session létrehozása…';

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(`${apiBase}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Nem sikerült létrehozni a checkout sessiont.');
      }

      if (!result.checkout_url) {
        throw new Error('A checkout URL hiányzik a válaszból.');
      }

      feedback.textContent = 'Átirányítás a biztonságos checkout oldalra…';
      window.location.assign(result.checkout_url);
    } catch (error) {
      feedback.textContent = error.message || 'Váratlan hiba történt.';
    }
  });
})();
