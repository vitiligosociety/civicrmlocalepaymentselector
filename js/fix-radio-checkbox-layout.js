// This is a real hack to replace CiviCRM core markup which leaves a text space
// node after each label and can leave radio/checkboxes estranged from their
// labels. It also adds a little padding for finesse.
(function(CRM, $){$(function(){
'use strict';

$('form#Main').find('input[type="radio"] + label, input[type="checkbox"] + label').each(function() {
  if (this.nextSibling && this.nextSibling.nodeName === '#text') {
    this.parentNode.removeChild(this.nextSibling);
  }
  $(this)
    .css('padding-left', '0.5rem')
    .add(this.previousElementSibling)
    .wrapAll($('<div/>').addClass('input-label-pair'));
});

});})(CRM, CRM.$);
