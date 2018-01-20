var base64 = require("crypto-js/enc-base64")
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
const neo4j = require('neo4j-driver').v1;
const databaseUrl = 'bolt://138.197.144.198:7687';
const driver = neo4j.driver(databaseUrl, neo4j.auth.basic('neo4j', 'wangzhe1998'));
const session = driver.session();

class TransferRequest {
  constructor(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    this.token = randomToken(16);
    this.baseUrl = baseUrl;
    this.v2baseUrl = v2baseUrl;
    this.accessId = accessId;
    this.regId = regId;
    this.secretKey = base64.stringify(SHA256(`${this.token}:${secretKey}`));
  }
  
  async init() {
    this.accessToken = await this.auth();
    console.log(this.accessToken);
    this.accessTokenKey = JSON.parse(this.accessToken).access_token;
    this.options = {
      accessToken: `Bearer ${this.accessTokenKey}`,
      thirdPartyAccessId : this.accessId,
      requestId: 'test',
      deviceId: 'test',
      apiRegistrationId : this.regId
    }
    console.log(this.options);
  }
  
  async auth() {
    const options = {
      url: `${this.baseUrl}\\access-tokens`,
      headers: {
        'secretKey': this.secretKey,
        'salt': this.token,
        'thirdPartyAccessId': this.accessId
      }
    }
   return new Promise((resolve, reject) => {
     request.get(options, (error, response, body) => {
        if (error) console.log(error)
        resolve(body);
      });
    });
  }
}


class ContactRequest extends TransferRequest {
    constructor(secretKey, baseUrl, v2baseUrl, accessId, regId) {
      super(secretKey, baseUrl, v2baseUrl, accessId, regId);
    }
    
    async getContact() {
      await this.init();
        return new Promise ((resolve, reject) => {
          let options = {
            url: `${this.v2baseUrl}\\contacts`,
            headers: this.options
          }
          request.get(options, (error, response, body) => {
            if (error) console.log(error)
            resolve(body);
          });
        });
    }
    
    async addContact(contactName, type, dest, active = true, language = "en") {
      await this.init();
      return new Promise ((resolve, reject) => {
          let options = {
            url: `${this.v2baseUrl}\\contacts`,
            headers: this.options,
            json: true,
            body: {
              contactName,
              language,
              notificationPreferences: [{
                handle: dest,
                handleType: type,
                active: active
              }]
            }
          }
          request.post(options, (error, response, body) => {
            if (error) console.log(error)
            console.log(body);
            resolve(body);
          });
      });
    }
}

class MoneyRequest extends TransferRequest {
    constructor(secretKey, baseUrl, v2baseUrl, accessId, regId) {
      super(secretKey, baseUrl, v2baseUrl, accessId, regId);
    }
  
    async retrieveRequests() {
      await this.init();
      return new Promise((resolve, reject) => {
        let options = {
          url: `${this.v2baseUrl}/money-requests/send`,
          headers: this.options
        }
        request.get(options, (error, response, body) => {
          if (error) console.log(error)
          console.log(body);
          resolve(body);
        });
      });
    }
    
    async sendMoney(contact, amount, currency) {
      let expireDate = moment().add(7, 'days').toISOString();
      await this.init();
      return new Promise ((resolve, reject) => {
          let options = {
            url: `${this.v2baseUrl}/money-requests/send`,
            headers: this.options,
            json: true,
            body: {
              "sourceMoneyRequestId": Math.floor(Math.random() * 10000),
              "requestedFrom": contact,
              "amount": amount,
              "currency": "CAD",
              "editableFulfillAmount": false,
              "supressResponderNotifications": true,
              "requesterMessage": "test",
              "expiryDate": expireDate,
            }
          }
          request.post(options, (error, response, body) => {
            if (error) console.log(error)
            console.log(body);
            resolve(body);
          });
      });
    }
    
}

async function main () {
  var contactRequest = new ContactRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
// //  contactRequest.test();
//  await contactRequest.addContact('Francis Wang', 'email', 'z687wang@edu.uwaterloo.ca', true, 'en');
  var kevin = JSON.parse(await contactRequest.getContact());
  console.log(kevin[0]);
  var moneyRequest = new MoneyRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
  await moneyRequest.sendMoney(kevin[0], 30.00);
  //await moneyRequest.retrieveRequests();
}

main();
