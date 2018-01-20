"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var base64 = require("crypto-js/enc-base64");
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
var GraphicDatabase = require('./database');

var TransferRequest = function () {
  function TransferRequest(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    _classCallCheck(this, TransferRequest);

    this.token = randomToken(16);
    this.baseUrl = baseUrl;
    this.v2baseUrl = v2baseUrl;
    this.accessId = accessId;
    this.regId = regId;
    this.secretKey = base64.stringify(SHA256(this.token + ":" + secretKey));
    this.database = new GraphicDatabase();
  }

  _createClass(TransferRequest, [{
    key: "init",
    value: async function init() {
      this.accessToken = await this.auth();
      console.log(this.accessToken);
      this.accessTokenKey = JSON.parse(this.accessToken).access_token;
      this.options = {
        accessToken: "Bearer " + this.accessTokenKey,
        thirdPartyAccessId: this.accessId,
        requestId: 'test',
        deviceId: 'test',
        apiRegistrationId: this.regId
      };
      console.log(this.options);
    }
  }, {
    key: "auth",
    value: async function auth() {
      var options = {
        url: this.baseUrl + "\\access-tokens",
        headers: {
          'secretKey': this.secretKey,
          'salt': this.token,
          'thirdPartyAccessId': this.accessId
        }
      };
      return new Promise(function (resolve, reject) {
        request.get(options, function (error, response, body) {
          if (error) console.log(error);
          resolve(body);
        });
      });
    }
  }]);

  return TransferRequest;
}();

module.exports = TransferRequest;