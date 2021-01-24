const argv = require('yargs').argv;
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
} = require('./contacts.js');

async function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      const list = await listContacts();
      console.table(list);
      break;

    case 'get':
      const contactToShow = await getContactById(id);
      console.table(contactToShow);
      break;

    case 'add':
      const listAfterAdd = await addContact(name, email, phone);
      console.table(listAfterAdd);
      break;

    case 'remove':
      const listAfterRemove = await removeContact(id);
      console.table(listAfterRemove);
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
