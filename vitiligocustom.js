(function(CRM, $){$(function(){

'use strict';

// The config placeholder here is replaced by php. Do not alter the line below at all.
var payment_processor_ids = {};//%config%

var $form = $('form#Main');
if (!$form.length) {
	return;
}


// Create UK radios.
function updateUi() {
  if ($inUK.is(":checked")) {
    // Show all options.
    $payment_processor.fadeIn('fast');
    // Nudge user to GoCardless.
    selectPaymentProcessor('GoCardless');
    updatePaymentProcessorNames('Direct Debit - more of your money goes to the Vitiligo Society', 'Recurring credit/debit card payment');
  }
  else {
    // Select Stripe.
    $payment_processor.hide(); // Normally hidden anyway, but just in case user changes mind on UKness.
    // Force user to use Stripe; GC not relevant outside UK.
    selectPaymentProcessor('Stripe');
    updatePaymentProcessorNames('', 'Recurring credit/debit card payment');
  }
}

/**
 * Find and click the input for either 'stripe' or 'gocardless' payment
 * processor based on configured Payment Processor Ids.
 */
function selectPaymentProcessor(processorType) {
  var found;
  var processorIds = payment_processor_ids[processorType] || [];

  $payment_processor.find('[name="payment_processor_id"]').each(function() {
    var m =this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
    if (m && m.length === 2 && processorIds.indexOf(m[1])>-1) {
      found = this;
    }
  });

  $(found).trigger('click');
}
/**
 * Update hints on the processor names.
 */
function updatePaymentProcessorNames(gcText, stripeText) {
  $payment_processor.find('[name="payment_processor_id"]').each(function() {
    var m =this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
    if (m && m.length === 2) {
      // Got processor ID. Is it stripe or GoCardless?
      if (payment_processor_ids['GoCardless'].indexOf(m[1]) > -1) {
        // GoCardless.
        $(this).next().text(gcText);

      }
      else if (payment_processor_ids['Stripe'].indexOf(m[1]) > -1) {
        // Stripe.
        $(this).next().text(stripeText);
      }

      if ($(this).next().next().prop('tagName') !== 'BR') {
        // Insert line break before input.
        $(this).next().next().before('<br/>');
      }
    }
  });

}

// Copy CiviCRM's default HTML structure.
var $container = $('<div/>').addClass('crm-public-form-item crm-section');
$container.append($('<div/>').addClass('label'));
var $div = $('<div/>').addClass('content').appendTo($container);
$container.append($('<div/>').addClass('clear'));

var $inUK = $('<input/>')
  .attr({id: 'in-uk-yes', value: '1', name: 'in-uk', type:'radio'})
  .on('click', updateUi)
  .appendTo($div);
$('<label/>')
  .attr('for', 'in-uk-yes')
  .text("I'm in the UK")
  .appendTo($div);
var $notInUK = $('<input/>')
  .attr({id: 'in-uk-no', value: '0', name: 'in-uk', type:'radio'})
  .on('click', updateUi)
  .appendTo($div);
$('<label/>')
  .attr('for', 'in-uk-no')
  .text("I'm not in the UK")
  .appendTo($div);

// This is a real hack to replace CiviCRM core markup which leaves a text space
// node after each label and can leave radio/checkboxes estranged from their
// labels. It also adds a little padding for finesse.
$form.find('input[type="radio"] + label, input[type="checkbox"] + label').each(function() {
  if (this.nextSibling && this.nextSibling.nodeName === '#text') {
    this.parentNode.removeChild(this.nextSibling);
  }
  $(this)
    .css('padding-left', '0.5rem')
    .add(this.previousElementSibling)
    .wrapAll($('<div/>').addClass('input-label-pair'));
});

var $payment_options = $form.find('.payment_options-group');
var $payment_processor = $payment_options.find('.payment_processor-section');
$payment_processor.hide().before($container);

// Finally, we need to override CiviCRM's events on the price set selection.
function overridePriceSetShowHide() {
  if (!$inUK.is(':checked') && !$notInUK.is(':checked')) {
    // Neither UK nor not UK is checked, so hide the other options for now.
    $payment_processor.hide();
  }
}
// Apply this when the price set is clicked.
$('.price-set-option-content input[type="radio"]').on('click', function() {
  overridePriceSetShowHide();
  // In case we are not called first, repeat this after giving 50ms for other processes to work.
  setTimeout(overridePriceSetShowHide, 50);
});

});})(CRM, CRM.$);
