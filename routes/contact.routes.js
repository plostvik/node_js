const { Router } = require('express');
const ContactController = require('../controller/contact.controller');

const router = Router();

router.get('/', ContactController.listContacts);
router.get(
  '/:contactId',
  ContactController.validateContactId,
  ContactController.getById,
);
router.post(
  '/',
  ContactController.validateAddContact,
  ContactController.addContact,
);
router.delete(
  '/:contactId',
  ContactController.validateContactId,
  ContactController.removeContact,
);
router.patch(
  '/:contactId',
  ContactController.validateContactId,
  ContactController.validateUpdateContact,
  ContactController.updateContact,
);

module.exports = router;
