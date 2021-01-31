const { v4: uuidv4 } = require('uuid');
const { promises: fsPromises } = require('fs');
const path = require('path');
const Joi = require('joi');
const contacts = require('../models/Contacts.json');

const contactsPath = path.join(__filename, '../../', 'models', 'Contacts.json');

class ContactController {
  listContacts(req, res) {
    res.json(contacts);
  }

  addChangesToContacts = () => {
    fsPromises.writeFile(contactsPath, JSON.stringify(contacts));
  };

  addContact = (req, res) => {
    const { body } = req;

    const createdContact = {
      ...body,
      id: uuidv4(),
    };

    if (contacts.find(contact => contact.name === body.name)) {
      return res
        .status(409)
        .json({ message: 'Contact with this name already exists' });
    }

    contacts.push(createdContact);
    this.addChangesToContacts();

    res.status(201).json(createdContact);
  };

  getById = (req, res) => {
    const { contactId } = req.params;
    const requestedContact = contacts.find(({ id }) => id === contactId);

    res.json(requestedContact);
  };

  validateContactId = (req, res, next) => {
    const { contactId } = req.params;
    const contactIndex = this.findContactIndex(contactId);

    if (contactIndex === -1) {
      return res.status(404).json({ message: 'Not found' });
    }

    next();
  };

  findContactIndex = parsedId => {
    return contacts.findIndex(({ id }) => id === parsedId);
  };

  validateAddContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ message: 'missing required name field' });
    }
    next();
  }

  removeContact = (req, res) => {
    const { contactId } = req.params;
    const contactIndex = this.findContactIndex(contactId);

    contacts.splice(contactIndex, 1);
    this.addChangesToContacts();

    res.status(200).json({ message: 'contact deleted' });
  };

  updateContact = (req, res) => {
    const { contactId } = req.params;
    const contactIndex = this.findContactIndex(contactId);

    const updatedContact = {
      ...contacts[contactIndex],
      ...body,
    };

    contacts[contactIndex] = updatedContact;
    this.addChangesToContacts();

    res.json(updatedContact);
  };

  validateUpdateContact(req, res, next) {
    const { body } = req;

    if (Object.keys(body).length === 0) {
      return res.status(404).json({ message: 'missing fields' });
    }

    const validationRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res
        .status(400)
        .json({ message: 'field format need to be a string' });
    }

    next();
  }
}

module.exports = new ContactController();
