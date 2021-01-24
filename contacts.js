const { v4: uuidv4 } = require('uuid');
const { promises: fsPromises } = require('fs');
const path = require('path');

const contactsPath = path.join(__filename, '../', 'db', 'contacts.json');

async function listContacts() {
  let parsedContactList = [];
  try {
    const contactList = await fsPromises.readFile(contactsPath, 'utf-8');
    parsedContactList = JSON.parse(contactList);
    return parsedContactList;
  } catch (err) {
    console.log(err);
    return parsedContactList;
  }
}

async function getContactById(contactId) {
  const parsedContactList = await listContacts();
  const contactToShow = parsedContactList.find(
    contact => contact.id === contactId,
  );
  return contactToShow;
}

async function removeContact(contactId) {
  const parsedContactList = await listContacts();
  const contactListAfterDelete = parsedContactList.filter(
    contact => contact.id !== contactId,
  );

  fsPromises.writeFile(contactsPath, JSON.stringify(contactListAfterDelete));

  return contactListAfterDelete;
}

async function addContact(name, email, phone) {
  const parsedContactList = await listContacts();
  const generatedId = uuidv4();
  const newList = [
    ...parsedContactList,
    { id: generatedId, name, email, phone },
  ];

  fsPromises.writeFile(contactsPath, JSON.stringify(newList));

  return newList;
}

module.exports = { listContacts, getContactById, removeContact, addContact };
