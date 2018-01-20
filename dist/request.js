"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var base64 = require("crypto-js/enc-base64");
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
var neo4j = require('neo4j-driver').v1;
var databaseUrl = 'bolt://138.197.144.198:7687';
var driver = neo4j.driver(databaseUrl, neo4j.auth.basic('neo4j', 'wangzhe1998'));
var session = driver.session();

var TransferRequest = function () {
  function TransferRequest(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    _classCallCheck(this, TransferRequest);

    this.token = randomToken(16);
    this.baseUrl = baseUrl;
    this.v2baseUrl = v2baseUrl;
    this.accessId = accessId;
    this.regId = regId;
    this.secretKey = base64.stringify(SHA256(this.token + ":" + secretKey));
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

var ContactRequest = function (_TransferRequest) {
  _inherits(ContactRequest, _TransferRequest);

  function ContactRequest(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    _classCallCheck(this, ContactRequest);

    return _possibleConstructorReturn(this, (ContactRequest.__proto__ || Object.getPrototypeOf(ContactRequest)).call(this, secretKey, baseUrl, v2baseUrl, accessId, regId));
  }

  _createClass(ContactRequest, [{
    key: "getContact",
    value: async function getContact() {
      var _this2 = this;

      await this.init();
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this2.v2baseUrl + "\\contacts",
          headers: _this2.options
        };
        request.get(options, function (error, response, body) {
          if (error) console.log(error);
          resolve(body);
        });
      });
    }
  }, {
    key: "addContact",
    value: async function addContact(contactName, type, dest) {
      var _this3 = this;

      var active = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var language = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "en";

      await this.init();
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this3.v2baseUrl + "\\contacts",
          headers: _this3.options,
          json: true,
          body: {
            contactName: contactName,
            language: language,
            notificationPreferences: [{
              handle: dest,
              handleType: type,
              active: active
            }]
          }
        };
        request.post(options, function (error, response, body) {
          if (error) console.log(error);
          console.log(body);
          resolve(body);
        });
      });
    }
  }]);

  return ContactRequest;
}(TransferRequest);

var MoneyRequest = function (_TransferRequest2) {
  _inherits(MoneyRequest, _TransferRequest2);

  function MoneyRequest(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    _classCallCheck(this, MoneyRequest);

    return _possibleConstructorReturn(this, (MoneyRequest.__proto__ || Object.getPrototypeOf(MoneyRequest)).call(this, secretKey, baseUrl, v2baseUrl, accessId, regId));
  }

  _createClass(MoneyRequest, [{
    key: "retrieveRequests",
    value: async function retrieveRequests() {
      var _this5 = this;

      await this.init();
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this5.v2baseUrl + "/money-requests/send",
          headers: _this5.options
        };
        request.get(options, function (error, response, body) {
          if (error) console.log(error);
          console.log(body);
          resolve(body);
        });
      });
    }
  }, {
    key: "sendMoney",
    value: async function sendMoney(contact, amount, currency) {
      var _this6 = this;

      var expireDate = moment().add(7, 'days').toISOString();
      await this.init();
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this6.v2baseUrl + "/money-requests/send",
          headers: _this6.options,
          json: true,
          body: {
            "sourceMoneyRequestId": Math.floor(Math.random() * 10000),
            "requestedFrom": contact,
            "amount": amount,
            "currency": "CAD",
            "editableFulfillAmount": false,
            "supressResponderNotifications": true,
            "requesterMessage": "test",
            "expiryDate": expireDate
          }
        };
        request.post(options, function (error, response, body) {
          if (error) console.log(error);
          console.log(body);
          resolve(body);
        });
      });
    }
  }]);

  return MoneyRequest;
}(TransferRequest);

async function main() {
  var contactRequest = new ContactRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
  // //  contactRequest.test();
  //  await contactRequest.addContact('Francis Wang', 'email', 'z687wang@edu.uwaterloo.ca', true, 'en');
  var kevin = JSON.parse((await contactRequest.getContact()));
  console.log(kevin[0]);
  var moneyRequest = new MoneyRequest('vjwVOuYOo_3UL6ykXBFHqLKn6VDi_3kIVwgu7iw3uRA', 'https://gateway-web.beta.interac.ca/publicapi/api/v1', 'https://gateway-web.beta.interac.ca/publicapi/api/v2', 'CA1TATwB8EPGjb9z', 'CA1ARshAuywjhrgV');
  await moneyRequest.sendMoney(kevin[0], 30.00);
  //await moneyRequest.retrieveRequests();
}

main();