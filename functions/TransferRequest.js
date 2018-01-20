var base64 = require("crypto-js/enc-base64")
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
const GraphicDatabase = require('./database');

class TransferRequest {
  constructor(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    this.token = randomToken(16);
    this.baseUrl = baseUrl;
    this.v2baseUrl = v2baseUrl;
    this.accessId = accessId;
    this.regId = regId;
    this.secretKey = base64.stringify(SHA256(`${this.token}:${secretKey}`));
    this.database = new GraphicDatabase();
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

module.exports = TransferRequest;