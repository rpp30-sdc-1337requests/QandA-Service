"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAnswerReport = exports.putAnswerHelpful = exports.putQuestionReport = exports.putQuestionHelpful = exports.postAnswer = exports.postQuestion = exports.getAnswers = exports.getQuestions = void 0;
const { Client } = require('pg');
const client = new Client({
    user: 'ubuntu',
    host: '3.95.241.175',
    database: 'qanda',
    password: 'ubuntu',
    port: 5433
});
client.connect();
const getQuestions = (productID, count) => {
    const queryString = `SELECT q.question_id, question_body, question_date, asker_name, q.reported, q.helpful,
  (
    COALESCE (
      jsonb_object_agg( a.answer_id,
      jsonb_build_object(
        'id', a.answer_id,
        'body', a.answer_body,
        'date', a.answer_date,
        'answerer_name', a.answerer_name,
        'helpfulness', a.helpful,
        'photos', '[]'
      )
      )FILTER (WHERE a.answer_id IS NOT NULL AND a.reported = false),
      '{}'::JSONB)
  ) answers
  FROM questions q
  LEFT JOIN answers a
  ON q.question_id = a.question_id
  WHERE q.product_id = $1 AND q.reported = false
  GROUP BY q.question_id
  LIMIT $2;`;
    return client.query(queryString, [productID, count]);
};
exports.getQuestions = getQuestions;
const getAnswers = (questionID, count) => {
    const queryString = `SELECT a.answer_id, a.answer_body AS body, a.answer_date AS date, a.answerer_name AS name, a.helpful AS helpfulness,
  (COALESCE (
    jsonb_agg(
      jsonb_build_object(
        'id', ap.photo_id,
        'url', ap.url
      )
    ) FILTER (WHERE ap.photo_id IS NOT NULL),
'[]'::JSONB)) AS photos
  FROM answers a
  LEFT JOIN answer_photos ap
  ON ap.answer_id = a.answer_id
  WHERE a.reported = false AND a.question_id = $1
  GROUP BY a.answer_id, ap.url
  ORDER BY a.answer_id
  LIMIT $2;`;
    return client.query(queryString, [questionID, count]);
};
exports.getAnswers = getAnswers;
const postQuestion = (productID, body, name, email) => {
    const queryString = 'INSERT INTO questions(product_id, question_body, asker_name, asker_email) \
                      VALUES ($1, $2, $3, $4);';
    return client.query(queryString, [productID, body, name, email]);
};
exports.postQuestion = postQuestion;
const postAnswer = (questionID, body, name, email, photos) => {
    const queryString = 'WITH insAnswer AS (\
                        INSERT INTO answers(question_id, answer_body, answerer_name, answerer_email) \
                        VALUES ($1, $2, $3, $4) \
                        RETURNING answer_id\
                      ) \
                      INSERT INTO answer_photos(answer_id, url)\
                      VALUES ((SELECT answer_id FROM insAnswer), $5);';
    return client.query(queryString, [questionID, body, name, email, photos]);
};
exports.postAnswer = postAnswer;
const putQuestionHelpful = (questionID) => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = 'UPDATE questions SET helpful = helpful + 1 WHERE questions.question_id = $1;';
    return client.query(queryString, [questionID]);
});
exports.putQuestionHelpful = putQuestionHelpful;
const putQuestionReport = (questionID) => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = 'UPDATE questions SET reported = true WHERE questions.question_id = $1;';
    return client.query(queryString, [questionID]);
});
exports.putQuestionReport = putQuestionReport;
const putAnswerHelpful = (answerID) => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = 'UPDATE answers SET helpful = helpful + 1 WHERE answers.answer_id = $1;';
    return client.query(queryString, [answerID]);
});
exports.putAnswerHelpful = putAnswerHelpful;
const putAnswerReport = (answerID) => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = 'UPDATE answers SET reported = true WHERE answers.answer_id = $1;';
    return client.query(queryString, [answerID]);
});
exports.putAnswerReport = putAnswerReport;
module.exports = {
    client,
    getQuestions: exports.getQuestions,
    getAnswers: exports.getAnswers,
    postQuestion: exports.postQuestion,
    postAnswer: exports.postAnswer,
    putQuestionReport: exports.putQuestionReport,
    putQuestionHelpful: exports.putQuestionHelpful,
    putAnswerReport: exports.putAnswerReport,
    putAnswerHelpful: exports.putAnswerHelpful
};
