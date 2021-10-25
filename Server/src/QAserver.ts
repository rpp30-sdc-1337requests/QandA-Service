import { getQuestionsForProduct } from './database';
import express, { Request, Response } from 'express';
const app = express();

// We want all of our requests from the FEC API to hit this server and return
// required data from the server
app.get('/qa/questions', (req: Request, res: Response) => {
  console.log('req query', req.query.page);
  res.status(200);
  let count = req.query.count || '5';
  let page = req.query.page || '0';
  let product_id = req.query.product_id;
  getQuestionsForProduct(page as string, count as string, product_id as string)
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