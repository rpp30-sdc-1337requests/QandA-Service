require('dotenv').config();

const { Client, Pool } = require('pg');
const client = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB,
  password: process.env.DB_PASS,
  port: 5433
});

client.connect();

export const getQuestions = (productID: string, count: number) => {
  const queryString =
  `SELECT q.question_id, question_body, question_date, asker_name, q.reported, q.helpful,
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
  LIMIT $2;`
  return client.query(queryString, [productID, count])
}

export const getAnswers = (questionID: string, count: number) => {
  const queryString =
  `SELECT a.answer_id, a.answer_body AS body, a.answer_date AS date, a.answerer_name AS name, a.helpful AS helpfulness,
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
  LIMIT $2;`
  return client.query(queryString, [questionID, count])
}

export const postQuestion = (productID: number, body: string, name: string, email: string) => {
  const queryString = 'INSERT INTO questions(product_id, question_body, asker_name, asker_email) \
                      VALUES ($1, $2, $3, $4);'
  return client.query(queryString, [productID, body, name, email]);
}

export const postAnswer = (questionID: string, body: string, name: string, email: string) => {
  const queryString = 'INSERT INTO answers(question_id, answer_body, answerer_name, answerer_email) \
                      VALUES ($1, $2, $3, $4) \
                      RETURNING answer_id'
  return client.query(queryString, [questionID, body, name, email])
}

export const postAnswerPhotos = (answer_id: string, photos: string[]) => {
  const queryString = 'INSERT INTO answer_photos(answer_id, url)\
                       VALUES ($1, $2);'
  return client.query(queryString, [answer_id, photos]);
}

export const putQuestionHelpful = async (questionID: string) => {
  const queryString = 'UPDATE questions SET helpful = helpful + 1 WHERE questions.question_id = $1;'
  return client.query(queryString, [questionID]);
}

export const putQuestionReport = async (questionID: string) => {
  const queryString = 'UPDATE questions SET reported = true WHERE questions.question_id = $1;'
  return client.query(queryString, [questionID]);

}

export const putAnswerHelpful = async (answerID: string) => {
  const queryString = 'UPDATE answers SET helpful = helpful + 1 WHERE answers.answer_id = $1;'
  return client.query(queryString, [answerID]);
}

export const putAnswerReport = async (answerID: string) => {
  const queryString = 'UPDATE answers SET reported = true WHERE answers.answer_id = $1;'
  return client.query(queryString, [answerID]);

}

module.exports = {
  client,
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  postAnswerPhotos,
  putQuestionReport,
  putQuestionHelpful,
  putAnswerReport,
  putAnswerHelpful
}