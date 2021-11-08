import {
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  putQuestionReport,
  putQuestionHelpful,
  putAnswerReport,
  putAnswerHelpful
} from './database';

import express, { json, Request, Response } from 'express';
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// We want all of our requests from the FEC API to hit this server and return
// required data from the server

//GET REQUESTS
app.get('/qa/questions', (req: Request, res: Response) => {
  let count = req.query.count || 5;
  // let page = req.query.page || 1;
  let product_id = req.query.product_id;
  getQuestions(product_id as string, count as number)
    .then((questions: any) => {
      const result = {
        product_id,
        results: questions.rows
      }
      res.status(200).json(result);
    })
    .catch((err: any) => {
      res.send(err)
    });
})

app.get('/qa/questions/:question_id/answers', (req: Request, res: Response) => {
  let question_id = req.params.question_id;
  let count = req.query.page || 5;
  getAnswers(question_id as string, count as number)
    .then((answers: any) => {
      // console.log('we are responding with answers', answers)
      const result = {
        question: question_id,
        page: 1,
        count,
        results: answers.rows
      }
      res.status(200).json(result)
    })
    .catch((err: Error) => {
      console.log(err)
      res.end(err)
    })
})

//POST REQUESTS
app.post('/qa/questions', (req: Request, res: Response) => {
  // console.log('we are responding with questions', req.body)
  let { body, name, email, product_id } = req.body.data;
  postQuestion(product_id as number, body as string, name as string, email as string)
    .then((question: { command: string }) => {
      res.status(201).send(question.command);
    })
    .catch((err: Error) => {
      console.log(err);
      res.sendStatus(500);
    })
})

app.post('/qa/questions/:question_id/answers', (req: Request, res: Response) => {
  // console.log('we are responding with answers', req.body, req.params)
  let { body, name, email } = req.body;
  let { question_id } = req.params;
  let photos = req.body.photos[0];
  postAnswer(question_id, body, name, email, photos)
    .then((question: { command: string }) => {
      res.status(201).send(question.command)
    })
    .catch((err: Error) => {
      console.log(err)
      res.sendStatus(500);
    })
})

//PUT REQUESTS HELPFUL
app.put('/qa/questions/:question_id/helpful', (req: Request, res: Response) => {
  putQuestionHelpful(req.params.question_id)
    .then(posted => {
      // console.log('is this helpful', posted)
      res.status(201).send(posted.command);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    })
})

app.put('/qa/answers/:answer_id/helpful', (req: Request, res: Response) => {
  putAnswerHelpful(req.params.answer_id)
    .then(posted => {
      // console.log('is this helpful answer', posted.command)
      res.status(500).send(posted.command);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    })
})

//PUT REQUESTS REPORT
app.put('/qa/questions/:question_id/report', (req: Request, res: Response) => {
  putQuestionReport(req.params.question_id)
    .then(posted => {
      // console.log('is this report', posted)
      res.status(500).send(posted.command);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    })
})

app.put('/qa/answers/:answer_id/report', (req: Request, res: Response) => {
  putAnswerReport(req.params.answer_id)
    .then(posted => {
      // console.log('is this report', posted)
      res.status(500).send(posted.command);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    })
})


app.listen(8080, () => {
  console.log('We are connected to Q&A Server');
});