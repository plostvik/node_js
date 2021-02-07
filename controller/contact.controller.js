const {
  Types: { ObjectId },
} = require('mongoose');
const Joi = require('joi');
const Contact = require('../models/Contacts');

class ContactController {
  async getContatcs(req, res) {
    try {
      const contacts = await Contact.find();
      res.json(contacts);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  addContact = async (req, res) => {
    try {
      const { body } = req;
      const newContact = await Contact.create(body);
      res.status(201).json(newContact);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  getById = async (req, res) => {
    try {
      const { contactId } = req.params;
      const requestedContact = await Contact.findById(contactId);

      if (!requestedContact) {
        return res.status(404).json({ message: 'Not found' });
      }

      res.json(requestedContact);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  validateContactId = (req, res, next) => {
    const { contactId } = req.params;

    if (!ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: 'Your id is not valid' });
    }

    next();
  };

  validateAddContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      subscription: Joi.string().required(),
      password: Joi.string().required(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ message: 'missing required name field' });
    }

    next();
  }

  removeContact = async (req, res) => {
    try {
      const { contactId } = req.params;
      const deletedContact = await Contact.findByIdAndDelete(contactId);

      if (!deletedContact) {
        return res.status(404).json({ message: 'Not found' });
      }

      res.status(200).json({ message: 'contact deleted' });
    } catch (err) {
      res.status(400).send(err);
    }
  };

  updateContact = async (req, res) => {
    try {
      const { contactId } = req.params;
      const { body } = req;
      const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
        new: true,
      });

      if (!updatedContact) {
        return res.status(404).json({ message: 'Not found' });
      }

      res.json(updatedContact);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  validateUpdateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string(),
      password: Joi.string(),
    }).min(1);

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
