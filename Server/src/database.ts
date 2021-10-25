const { Client } = require('pg');
const client = new Client({
  user: 'Jeremiah',
  host: 'localhost',
  database: 'qanda',
  password: '',
  port: 5432
});

client.connect();

export const getQuestionsForProduct = async (page: string, count: string, productID: string) => {
  productID = productID.toString();
  let queryString = 'SELECT * FROM questions WHERE product_id = $3 LIMIT $2 OFFSET $1';
  try {
    let questions = await client.query(queryString, [page, count, productID])
    // console.log(questions.rows);
    return questions.rows;
  } catch (err) {
    throw err;
  }
}

module.exports = { getQuestionsForProduct }