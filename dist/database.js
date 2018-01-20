'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var neo4j = require('neo4j-driver').v1;
var databaseUrl = 'bolt://138.197.144.198:7687';

var GraphicDatabase = function () {
  function GraphicDatabase() {
    _classCallCheck(this, GraphicDatabase);

    this.driver = neo4j.driver(databaseUrl, neo4j.auth.basic('neo4j', 'wangzhe1998'));
  }

  _createClass(GraphicDatabase, [{
    key: 'createPeople',
    value: async function createPeople(contactName, contactId, type, dest) {
      var _this = this;

      this.session = this.driver.session();
      var email = type == 'email' ? dest : null;
      var phone = type == 'phone' ? dest : null;
      var query = 'CREATE (n:Person { name: \'' + contactName + '\', contactId: \'' + contactId + '\', email: \'' + email + '\', phone: \'' + phone + '\' })';
      return new Promise(function (resolve, reject) {
        _this.session.run(query).then(function (res) {
          console.log(res);
          resolve(res);
          _this.session.close();
        });
      });
    }
  }, {
    key: 'transaction',
    value: async function transaction(contactName, contactId, amount) {
      var _this2 = this;

      this.session = this.driver.session();
      var query = 'MATCH (a:Person),(b:Person)\n      WHERE a.name = \'Walt\' AND b.name = \'' + contactName + '\'\n      CREATE (a)-[r:Sent {amount: \'' + amount + '\', currency: \'CAD\', time: \'' + new Date().toISOString() + '\'}]->(b)\n      RETURN r';
      return new Promise(function (resolve, reject) {
        _this2.session.run(query).then(function (res) {
          console.log(res);
          resolve(res);
          _this2.session.close();
        });
      });
    }
  }, {
    key: 'deleteDuplicateContact',
    value: async function deleteDuplicateContact(contactName) {
      var _this3 = this;

      this.session = this.driver.session();
      var query = 'MATCH (p:Person)\n        WITH p.id as id, collect(p) AS nodes \n        WHERE size(nodes) >  1\n        FOREACH (p in tail(nodes) | DETACH DELETE p)';

      return new Promise(function (resolve, reject) {
        _this3.session.run(query).then(function (res) {
          console.log(res);
          resolve(res);
          _this3.session.close();
        });
      });
    }
  }]);

  return GraphicDatabase;
}();

module.exports = GraphicDatabase;