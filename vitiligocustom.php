<?php

const VITILIGO_MEMBERSHIP_FORM_ID = '1';
const VITILIGO_DONATION_FORM_ID   = '2';

require_once 'vitiligocustom.civix.php';
use CRM_Vitiligocustom_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function vitiligocustom_civicrm_config(&$config) {
  _vitiligocustom_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_xmlMenu().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_xmlMenu
 */
function vitiligocustom_civicrm_xmlMenu(&$files) {
  _vitiligocustom_civix_civicrm_xmlMenu($files);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function vitiligocustom_civicrm_install() {
  _vitiligocustom_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_postInstall().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_postInstall
 */
function vitiligocustom_civicrm_postInstall() {
  _vitiligocustom_civix_civicrm_postInstall();
}

/**
 * Implements hook_civicrm_uninstall().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_uninstall
 */
function vitiligocustom_civicrm_uninstall() {
  _vitiligocustom_civix_civicrm_uninstall();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function vitiligocustom_civicrm_enable() {
  _vitiligocustom_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_disable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function vitiligocustom_civicrm_disable() {
  _vitiligocustom_civix_civicrm_disable();
}

/**
 * Implements hook_civicrm_upgrade().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_upgrade
 */
function vitiligocustom_civicrm_upgrade($op, CRM_Queue_Queue $queue = NULL) {
  return _vitiligocustom_civix_civicrm_upgrade($op, $queue);
}

/**
 * Implements hook_civicrm_managed().
 *
 * Generate a list of entities to create/deactivate/delete when this module
 * is installed, disabled, uninstalled.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_managed
 */
function vitiligocustom_civicrm_managed(&$entities) {
  _vitiligocustom_civix_civicrm_managed($entities);
}

/**
 * Implements hook_civicrm_caseTypes().
 *
 * Generate a list of case-types.
 *
 * Note: This hook only runs in CiviCRM 4.4+.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_caseTypes
 */
function vitiligocustom_civicrm_caseTypes(&$caseTypes) {
  _vitiligocustom_civix_civicrm_caseTypes($caseTypes);
}

/**
 * Implements hook_civicrm_angularModules().
 *
 * Generate a list of Angular modules.
 *
 * Note: This hook only runs in CiviCRM 4.5+. It may
 * use features only available in v4.6+.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules
 */
function vitiligocustom_civicrm_angularModules(&$angularModules) {
  _vitiligocustom_civix_civicrm_angularModules($angularModules);
}

/**
 * Implements hook_civicrm_alterSettingsFolders().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterSettingsFolders
 */
function vitiligocustom_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _vitiligocustom_civix_civicrm_alterSettingsFolders($metaDataFolders);
}

/**
 * Implements hook_civicrm_entityTypes().
 *
 * Declare entity types provided by this module.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_entityTypes
 */
function vitiligocustom_civicrm_entityTypes(&$entityTypes) {
  _vitiligocustom_civix_civicrm_entityTypes($entityTypes);
}


/**
 * Implements hook_civicrm_buildForm in order to inject custom js for membership forms.
 *
 * @see https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_buildForm/
 */
function vitiligocustom_civicrm_buildForm($formName, &$form) {

  if ($formName !== 'CRM_Contribute_Form_Contribution_Main') {
    return;
  }

  $js = $css = '';
  if ($form->_id === VITILIGO_MEMBERSHIP_FORM_ID) {
    // We need to lookup Stripe and GoCardless payment processors' IDs.

    // Lookup Stripe and GoCardless payment procesor types; create an array like <ID> => 'type'
    $types = civicrm_api3('PaymentProcessorType', 'get', [
      'sequential' => 1,
      'return' => ["id", "name"],
      'name' => ['IN' => ["Stripe", "GoCardless"]],
    ]);
    $type_ids = [];
    foreach ($types['values'] as $_) {
      $type_ids[$_['id']] = $_['name'];
    }

    // Find payment processors.
    $processors = civicrm_api3('PaymentProcessor', 'get', [
      'payment_processor_type_id' => ['IN' => array_keys($type_ids)],
      'return' => ['id', 'payment_processor_type_id'],
      'options' => ['limit' => 0]]);
    $config = ['GoCardless' => [], 'Stripe' => []];
    foreach ($processors['values'] as $_) {
      $config[$type_ids[$_['payment_processor_type_id']]][] = $_['id'];
    }
    $config = json_encode($config);

    // See https://docs.civicrm.org/dev/en/latest/framework/region/#adding-content-to-a-region
    // Nb. there is a mechanism for adding a script tag that fetches a script by URL.
    // However, that's likely to be slower than just including the file here since it's another
    // round-trip.
    // Also note 'Note: WP support is inconsistent pending refactor.' - from link above.
    $js = file_get_contents(__DIR__ . '/js/membership-form.js');
    $js = str_replace('var payment_processor_ids = {};//%config%', "var payment_processor_ids = $config;", $js);
    $js .= file_get_contents(__DIR__ . '/js/fix-radio-checkbox-layout.js');
    $css = file_get_contents(__DIR__ . '/vitiligocustom.css');
  }
  elseif ($form->_id === VITILIGO_DONATION_FORM_ID) {
    $js = file_get_contents(__DIR__ . '/js/fix-radio-checkbox-layout.js');
    $css = file_get_contents(__DIR__ . '/vitiligocustom.css');
  }

  if ($js || $css) {
    CRM_Core_Region::instance('page-body')->add(['markup' => "<script>$js</script><style>$css</style>"]);
  }
}
