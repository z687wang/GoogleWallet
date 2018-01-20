/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/

const TransferRequest = require('./TransferRequest');
const MoneyRequest = require('./MoneyRequest');
const ContactRequest = require('./ContactRequest');
const functions = require('firebase-functions');

const DialogflowApp = require('actions-on-google').DialogflowApp;

const secretKey = 'vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA';
const v1Url = 'https://gateway-web.beta.interac.ca/publicapi/api/v1';
const v2Url = 'https://gateway-web.beta.interac.ca/publicapi/api/v2';
const accessId = 'CA1TATwB8EPGjb9z';
const regId = 'CA1ARshAuywjhrgV';


const AMOUNT = "amount";
const FIRSTNAME = 'firstName';
const CURRENCY = 'currency';
const EMAIL = 'email';
const PHONE = 'phone';

let newContact = '';
let moneyRequest = new MoneyRequest(secretKey, v1Url, v2Url, accessId, regId);
let contactRequest = new ContactRequest(secretKey, v1Url, v2Url, accessId, regId);
let transferRequest = new TransferRequest(secretKey, v1Url, v2Url, accessId, regId);

exports.googleWallet = functions.https.onRequest((req, res) => {
  const app = new DialogflowApp({request: req, resonse: res});

  let actionMap = new Map();
  //actionMap.set('wallet.starts', app => app.ask('Welcome to google Wallet, What do you need today?'));
  actionMap.set('wallet.getArgs',getArgs);
  actionMap.set('wallet.getContact', getContact);
  app.handleRequest(actionMap);

  function getArgs(app)
  {
    if (checkArg(app))
    {
      checkContact(app);
      app.tell("done");
    } else
    {
      app.tell("fail");
    }
  }

  function getContact(app)
  {
    if (app.getArgument(EMAIL)) {
      addEmail(app);
    }
    else if (app.getArgument(PHONE)) {
      addPhone(app);
    }
    else {
      app.ask('Sorry, I don\'t quite understand. Can you please repeat it again?');
    }
  }
});



async function addEmail(app) {
  await contactRequest.addContact(newContact, 'email', app.getArgument(EMAIL), true, 'en');
}

async function addPhone(app) {
  await contactRequest.addContact(newContact, 'phone', app.getArgument(PHONE), true, 'en');
}

function checkArg(app) {
  if (app.getArgument(AMOUNT) && app.getArgument(FIRSTNAME)) return true;
  return false;
}

async function checkContact(app) {
  let contactName = app.getArgument(FIRSTNAME);
  let newContact = true;
  let contactList = JSON.parse(await contactRequest.getContact())[0];
  contactList.ForEach((contact) => {
      if (contact.contactName.toLowerCase() == contactName.toLowerCase()) {
        newContact = false;
        initPayment(app, contact);
      }
  });
  if (newContact) {
    addContact(app, contactName);
    newContact = contactName;
  }
  else app.tell("Old Contact");
}

function addContact(app, contactName) {
    app.ask(`Could you tell me more information about ${contactName}\'s email or telephone?`);
}

async function initPayment (app, contact) {
  const currency = app.getArgument(CURRENCY) || 'CAD';
  await moneyRequest.sendMoney(contact, app.getArgument(amount), currency);
}

function finalize() {
  moneyRequest.database.driver.close();
  contactRequest.database.driver.close();
}
