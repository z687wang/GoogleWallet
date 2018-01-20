const neo4j = require('neo4j-driver').v1;
const databaseUrl = 'bolt://138.197.144.198:7687';

class GraphicDatabase {
  constructor() {
    this.driver = neo4j.driver(databaseUrl, neo4j.auth.basic('neo4j', 'wangzhe1998'));
  }
  
  async createPeople(contactName, contactId, type, dest) {
    this.session = this.driver.session();
    const email = type == 'email'? dest: null;
    const phone = type == 'phone'? dest: null;
    const query = `CREATE (n:Person { name: '${contactName}', contactId: '${contactId}', email: '${email}', phone: '${phone}' })`;
    return new Promise((resolve, reject) => {
       this.session.run(query).then((res) => { 
         console.log(res);
         resolve(res);   
         this.session.close(); 
       });
    });
  }
  
  async transaction(contactName, contactId, amount) {
    this.session = this.driver.session();
    const query = `MATCH (a:Person),(b:Person)
      WHERE a.name = 'Walt' AND b.name = '${contactName}'
      CREATE (a)-[r:Sent {amount: '${amount}', currency: 'CAD', time: '${new Date().toISOString()}'}]->(b)
      RETURN r`;
      return new Promise((resolve, reject) => {
         this.session.run(query).then((res) => { 
           console.log(res);
           resolve(res);   
           this.session.close(); 
         });
      });
  }
  
  async deleteDuplicateContact(contactName) {
    this.session = this.driver.session();
    const query = `MATCH (p:Person)
        WITH p.id as id, collect(p) AS nodes 
        WHERE size(nodes) >  1
        FOREACH (p in tail(nodes) | DETACH DELETE p)`;
        
    return new Promise((resolve, reject) => {
       this.session.run(query).then((res) => { 
         console.log(res);
         resolve(res);   
         this.session.close(); 
       });
    });
  }
}

module.exports = GraphicDatabase;
