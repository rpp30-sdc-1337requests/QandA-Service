const { Client } = require('pg');
const client = new Client({
  user: 'Jeremiah',
  host: 'localhost',
  database: 'qanda',
  password: '',
  port: 5432
});
client.connect();

describe('initiate', () => {
  it('there is an active test suite', () => {
    expect(true).toBe(true);
  })
})

describe('querying the questions database returns an array of results', () => {
  it('contains 10 results when we select 10 questions', () => {
    client.query('SELECT * FROM questions LIMIT 10', (err, res) => {
      expect(res.rowCount).toBe(10)
      client.end();
    })
  })
})