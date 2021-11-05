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
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// We want all of our requests from the FEC API to hit this server and return
// required data from the server
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
        res.json(result);
    })
        .catch((err) => {
        res.send(err);
    });
});
app.get('/qa/questions/:question_id/answers', (req, res) => {
    console.log('req stuff', req.params, req.query);
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
        res.json(result);
    })
        .catch((err) => {
        console.log(err);
        res.end(err);
    });
});
//POST REQUESTS
app.post('/qa/questions', (req, res) => {
    console.log('hitting post on server', req.body);
    let { body, name, email, product_id } = req.body.data;
    (0, database_1.postQuestion)(product_id, body, name, email)
        .then((question) => {
        console.log('we are responding with answers', question.command);
        res.json(question.command);
    })
        .catch((err) => {
        console.log(err);
        res.end(err);
    });
});
app.post('/qa/questions/:question_id/answers', (req, res) => {
    console.log('req body', req.body, req.params);
    let { body, name, email } = req.body.data;
    let { question_id } = req.params;
    let photos = 'fakeURL';
    (0, database_1.postAnswer)(question_id, body, name, email, photos)
        .then((question) => {
        console.log('we are responding with answers', question);
        res.json(question);
    })
        .catch((err) => {
        console.log(err);
    });
});
//PUT REQUESTS HELPFUL
app.put('/qa/questions/:question_id/helpful', (req, res) => {
    (0, database_1.putQuestionHelpful)(req.params.question_id)
        .then(posted => {
        console.log('is this helpful', posted);
        res.send(posted.command);
    })
        .catch(err => {
        console.log(err);
    });
});
app.put('/qa/answers/:answer_id/helpful', (req, res) => {
    console.log('WE HERE DO');
    (0, database_1.putAnswerHelpful)(req.params.answer_id)
        .then(posted => {
        console.log('is this helpful answer', posted.command);
        res.send(posted.command);
    })
        .catch(err => {
        console.log(err);
    });
});
//PUT REQUESTS REPORT
app.put('/qa/questions/:question_id/report', (req, res) => {
    (0, database_1.putQuestionReport)(req.params.question_id)
        .then(posted => {
        console.log('is this report', posted);
        res.send(posted.command);
    })
        .catch(err => {
        console.log(err);
    });
});
app.put('/qa/answers/:answer_id/report', (req, res) => {
    (0, database_1.putAnswerReport)(req.params.answer_id)
        .then(posted => {
        console.log('is this report', posted);
        res.send(posted.command);
    })
        .catch(err => {
        console.log(err);
    });
});
app.listen(8080, () => {
    console.log('We are connected to Q&A Server');
});
