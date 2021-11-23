import {
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  putQuestionReport,
  putQuestionHelpful,
  putAnswerReport,
  putAnswerHelpful,
  postAnswerPhotos
} from './database';
import express, { Request, Response } from 'express';

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const redis = require("redis");
const redisClient = redis.createClient();

redisClient.on("error", function(error: any) {
  console.error(error);
});

app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// loader.io
app.get('/loaderio-aa3bce7f8bf5c5a88803f574aaf89ba7/', (req: Request, res: Response) => {
    res.status(200).send('loaderio-aa3bce7f8bf5c5a88803f574aaf89ba7')
})

// redis cache
const redisCache = (req: Request, res: Response, next: any) => {
  let product_id = req.query.product_id;
  redisClient.get(product_id, (err: Error, data: any) => {
    if (err) { throw err; }
    if (data != null) {
      console.log('it was cached')
      res.send(JSON.parse(data));
    } else {
      next();
    }
  })
}

//GET REQUESTS
app.get('/qa/questions', redisCache, (req: Request, res: Response) => {
  let count = req.query.count || 5;
  // let page = req.query.page || 1;
  let product_id = req.query.product_id;
  getQuestions(product_id as string, count as number)
    .then((questions: any) => {
      const result = {
        product_id,
        results: questions.rows
      }
      redisClient.set(product_id, JSON.stringify(result));
      res.status(200).json(result);
    })
    .catch((err: any) => {
      console.error(err);
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
      // console.log(err)
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
      // console.log(err);
      res.sendStatus(500);
    })
})

app.post('/qa/questions/:question_id/answers', (req: Request, res: Response) => {
  // console.log('we are responding with answers', req.body, req.params)
  let { body, name, email, photos } = req.body.data;
  let { question_id } = req.params;
  postAnswer(question_id, body, name, email)
    .then((answer: { command: string, rows: any }) => {
      let answer_id = answer.rows[0].answer_id;
      // console.log('this is response', answer_id, photos);
      let photoAdds = photos.map((photo: any) => {
        return postAnswerPhotos(answer_id, photo);
      })
      return Promise.all(photoAdds);
    })
    .then((success: any) => {
      res.status(201).send('INSERT')
    })
    .catch((err: Error) => {
      console.log(err)
      res.sendStatus(500);
    })
})

//PUT REQUESTS HELPFUL
app.put('/qa/questions/:question_id/helpful', (req: Request, res: Response) => {
  // console.log('is this helpful', req.params)
  putQuestionHelpful(req.params.question_id)
    .then(posted => {
      res.status(201).send(posted.command);
    })
    .catch(err => {
      // console.log(err);
      res.sendStatus(500);
    })
})

app.put('/qa/answers/:answer_id/helpful', (req: Request, res: Response) => {
  putAnswerHelpful(req.params.answer_id)
    .then(posted => {
      // console.log('is this helpful answer', posted.command)
      res.status(201).send(posted.command);
    })
    .catch((err: any) => {
      // console.log(err);
      res.status(500).send(err);
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
      // console.log(err);
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
      // console.log(err);
      res.sendStatus(500);
    })
})
//---------------------
app.listen(8080, () => {
  console.log('We are connected to Q&A Server');
});