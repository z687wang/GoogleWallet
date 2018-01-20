var base64 = require("crypto-js/enc-base64")
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
const TransferRequest = require('./TransferRequest');

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
      await this.database.transaction(contact.contactName, Math.floor(Math.random() * 1000), amount);
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

module.exports = MoneyRequest;