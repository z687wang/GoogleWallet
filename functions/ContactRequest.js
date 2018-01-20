var base64 = require("crypto-js/enc-base64")
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
var TransferRequest = require('./TransferRequest');


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
      await this.database.createPeople(contactName, Math.floor(Math.random() * 1000), type, dest);
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

module.exports = ContactRequest;