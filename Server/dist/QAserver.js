"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const redis = require("redis");
// const redisClient = redis.createClient();
// redisClient.on("error", function(error: any) {
//   console.error(error);
// });
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// loader.io
app.get('/loaderio-aa3bce7f8bf5c5a88803f574aaf89ba7/', (req, res) => {
    // var options = {
    //   root: path.join(__dirname)
    // };
    // res.sendFile('../../loaderio-f03ad0afb4e6b3d782900cd25abfa5f7.txt', options, (err) => {
    //   if (err) {console.log(err)}
    //   else {console.log('sent')}
    // });
    res.status(200).send('loaderio-aa3bce7f8bf5c5a88803f574aaf89ba7');
});
// redis cache
// const redisCache = (req: Request, res: Response) => {
//   let product_id = req.query.product_id;
//   redisClient.get(product_id, (err: Error, data: any) => {
//     if (err) {
//       throw err;
//     } else {
//       res.status(200).json(data);
//     }
//   })
// }
//GET REQUESTS
app.get('/qa/questions', (req, res) => {
    let count = req.query.count || 5;
    // let page = req.query.page || 1;
    let product_id = req.query.product_id;
    (0, database_1.getQuestions)(product_id, count)
        .then((questions) => {
        const result = {
            product_id,
            results: questions.rows
        };
        // redisClient.setex(product_id, 75, result);
        res.status(200).json(result);
    })
        .catch((err) => {
        // console.log(err);
        res.end(err);
    });
});
app.get('/qa/questions/:question_id/answers', (req, res) => {
    let question_id = req.params.question_id;
    let count = req.query.page || 5;
    (0, database_1.getAnswers)(question_id, count)
        .then((answers) => {
        // console.log('we are responding with answers', answers)
        const result = {
            question: question_id,
            page: 1,
            count,
            results: answers.rows
        };
        res.status(200).json(result);
    })
        .catch((err) => {
        // console.log(err)
        res.end(err);
    });
});
//POST REQUESTS
app.post('/qa/questions', (req, res) => {
    // console.log('we are responding with questions', req.body)
    let { body, name, email, product_id } = req.body.data;
    (0, database_1.postQuestion)(product_id, body, name, email)
        .then((question) => {
        res.status(201).send(question.command);
    })
        .catch((err) => {
        // console.log(err);
        res.sendStatus(500);
    });
});
app.post('/qa/questions/:question_id/answers', (req, res) => {
    // console.log('we are responding with answers', req.body, req.params)
    let { body, name, email, photos } = req.body.data;
    let { question_id } = req.params;
    (0, database_1.postAnswer)(question_id, body, name, email)
        .then((answer) => {
        let answer_id = answer.rows[0].answer_id;
        // console.log('this is response', answer_id, photos);
        let photoAdds = photos.map((photo) => {
            return (0, database_1.postAnswerPhotos)(answer_id, photo);
        });
        return Promise.all(photoAdds);
    })
        .then((success) => {
        res.status(201).send('INSERT');
    })
        .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});
//PUT REQUESTS HELPFUL
app.put('/qa/questions/:question_id/helpful', (req, res) => {
    // console.log('is this helpful', req.params)
    (0, database_1.putQuestionHelpful)(req.params.question_id)
        .then(posted => {
        res.status(201).send(posted.command);
    })
        .catch(err => {
        // console.log(err);
        res.sendStatus(500);
    });
});
app.put('/qa/answers/:answer_id/helpful', (req, res) => {
    (0, database_1.putAnswerHelpful)(req.params.answer_id)
        .then(posted => {
        // console.log('is this helpful answer', posted.command)
        res.status(201).send(posted.command);
    })
        .catch((err) => {
        // console.log(err);
        res.status(500).send(err);
    });
});
//PUT REQUESTS REPORT
app.put('/qa/questions/:question_id/report', (req, res) => {
    (0, database_1.putQuestionReport)(req.params.question_id)
        .then(posted => {
        // console.log('is this report', posted)
        res.status(500).send(posted.command);
    })
        .catch(err => {
        // console.log(err);
        res.sendStatus(500);
    });
});
app.put('/qa/answers/:answer_id/report', (req, res) => {
    (0, database_1.putAnswerReport)(req.params.answer_id)
        .then(posted => {
        // console.log('is this report', posted)
        res.status(500).send(posted.command);
    })
        .catch(err => {
        // console.log(err);
        res.sendStatus(500);
    });
});
//---------------------
app.listen(8080, () => {
    console.log('We are connected to Q&A Server');
});
