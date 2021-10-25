"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// We want all of our requests from the FEC API to hit this server and return
// required data from the server
app.get('/qa/questions', (req, res) => {
    console.log('req query', req.query.page);
    res.status(200);
    let count = req.query.count || '5';
    let page = req.query.page || '0';
    let product_id = req.query.product_id;
    (0, database_1.getQuestionsForProduct)(page, count, product_id)
        .then(questions => {
        console.log('this is questions in server', questions);
        res.json(questions);
    })
        .catch(err => {
        console.log(err);
    });
});
app.listen(3000, () => {
    console.log('We are connected to Q&A Server');
});
