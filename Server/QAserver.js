const { getQuestionsForProduct } = require('./database')
const express = require('express');
const app = express();

// We want all of our requests from the FEC API to hit this server and return
// required data from the server
app.get('/qa/questions', (req, res) => {
  console.log('req query', req.query)
  res.status(200);
  let { page, count, product_id } = req.query;
  getQuestionsForProduct(page, count, product_id)
    .then(questions => {
      console.log('this is questions in server', questions)
      res.json(questions)
    })
    .catch(err => {
      console.log(err)
    });
})

app.listen(3000, () => {
  console.log('We are connected to Q&A Server');
});
