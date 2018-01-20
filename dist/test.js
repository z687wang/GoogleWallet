'use strict';

var ContactRequest = require('./ContactRequest');
var MoneyRequest = require('./MoneyRequest');

async function main() {
  var contactRequest = new ContactRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
  await contactRequest.addContact('Alexandar', 'email', 'tonyzhe@foxmail.com', true, "en");
  var moneyRequest = new MoneyRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
  var kevin = JSON.parse((await contactRequest.getContact()))[0];
  console.log(kevin);
  await moneyRequest.sendMoney(kevin, '100', 'CAD');
  moneyRequest.database.driver.close();
  contactRequest.database.driver.close();
}

main();