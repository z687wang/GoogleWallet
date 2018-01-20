"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var base64 = require("crypto-js/enc-base64");
var SHA256 = require("crypto-js/sha256");
var randomToken = require('random-token');
var request = require('request');
var moment = require('moment');
var TransferRequest = require('./TransferRequest');

var MoneyRequest = function (_TransferRequest) {
  _inherits(MoneyRequest, _TransferRequest);

  function MoneyRequest(secretKey, baseUrl, v2baseUrl, accessId, regId) {
    _classCallCheck(this, MoneyRequest);

    return _possibleConstructorReturn(this, (MoneyRequest.__proto__ || Object.getPrototypeOf(MoneyRequest)).call(this, secretKey, baseUrl, v2baseUrl, accessId, regId));
  }

  _createClass(MoneyRequest, [{
    key: "retrieveRequests",
    value: async function retrieveRequests() {
      var _this2 = this;

      await this.init();
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this2.v2baseUrl + "/money-requests/send",
          headers: _this2.options
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
      var _this3 = this;

      var expireDate = moment().add(7, 'days').toISOString();
      await this.init();
      await this.database.transaction(contact.contactName, Math.floor(Math.random() * 1000), amount);
      return new Promise(function (resolve, reject) {
        var options = {
          url: _this3.v2baseUrl + "/money-requests/send",
          headers: _this3.options,
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

module.exports = MoneyRequest;