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
$('<input/>')
  .attr({id: 'in-uk-no', value: '0', name: 'in-uk', type:'radio'})
  .on('click', updateUi)
  .appendTo($div);
$('<label/>')
  .attr('for', 'in-uk-no')
  .text("I'm not in the UK")
  .appendTo($div);

var $payment_options = $form.find('.payment_options-group');
var $payment_processor = $payment_options.find('.payment_processor-section');
$payment_processor.hide().before($container);

});})(CRM, CRM.$);
