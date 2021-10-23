const { Client } = require('pg');
const client = new Client({
  user: 'Jeremiah',
  host: 'localhost',
  database: 'qanda',
  password: '',
  port: 5432
});

client.connect();

const getQuestionsForProduct = async (page = '1', count = '5', productID) => {
  productID = productID.toString();
  let queryString = 'SELECT * FROM questions WHERE product_id = $1 LIMIT $2';
  try {
    let questions = await client.query(queryString, [productID, count])
    // console.log(questions.rows);
    return questions.rows;
  } catch (err) {
    throw err;
    return;
  }
}

module.exports = { getQuestionsForProduct }