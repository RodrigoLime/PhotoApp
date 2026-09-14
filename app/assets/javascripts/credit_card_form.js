function initCreditCardForm() {
  var $form = $('.cc_form');

  // Only run on pages that actually have the credit-card form
  if ($form.length < 1) { return; }

  // Guard: if the Card Element is already mounted, don't mount a second one
  if ($('#card-element').children().length > 0) { return; }

  // Initialize Stripe with the publishable key we passed via the form's data attribute
  var stripe = Stripe($form.data('stripe-key'));

  // Build a Card Element (Stripe renders the card fields inside a secure iframe)
  var elements = stripe.elements();
  var card = elements.create('card');
  card.mount('#card-element');

  // Live-display validation errors as the user types
  card.on('change', function(event) {
    $('#card-errors').text(event.error ? event.error.message : '');
  });

  $form.on('submit', function(event) {
    // Stop the normal submit — we tokenize first, THEN submit
    event.preventDefault();
    $form.find('input[type=submit]').prop('disabled', true);

    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Card was declined / invalid — show the message and let them retry
        $('#card-errors').text(result.error.message);
        $form.find('input[type=submit]').prop('disabled', false);
      } else {
        // Success: attach the token as a hidden field, then submit for real
        $('<input>').attr({ type: 'hidden', name: 'payment[token]' })
                    .val(result.token.id)
                    .appendTo($form);
        $form.get(0).submit();
      }
    });
  });
}

// jQuery 3's function-form ready (fires on DOM ready) + turbolinks:load if Turbolinks is ever added
$(document).ready(initCreditCardForm);
$(document).on('turbolinks:load', initCreditCardForm);
