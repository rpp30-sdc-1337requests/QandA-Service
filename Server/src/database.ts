import { application } from "express";

const { Client } = require('pg');
const client = new Client({
  user: 'Jeremiah',
  host: 'localhost',
  database: 'qanda',
  password: '',
  port: 5432
});

client.connect();

//currently the way I have my DB queries setup, I am using 'then' blocks after async await, but I don't know how else to error handle

export const getQuestions = async (productID: string, count: number,) => {
  // productID = productID.toString();
  const queryString = `WITH questionsJSON AS (
      SELECT q.question_id, question_body, question_date, asker_name, q.reported, q.helpful,
        (CASE WHEN (
          string_agg(a.answer_id::varchar, ',' ORDER BY a.answer_id DESC)
          ) IS NOT NULL THEN
          jsonb_object_agg(a.answer_id::integer,
            jsonb_build_object(
              'id', a.answer_id,
              'body', a.answer_body,
              'date', a.answer_date,
              'answerer_name', a.answerer_name,
              'helpfulness', a.helpful,
              'photos', COALESCE
              (
                (SELECT jsonb_agg(answer_photos.url)
                FROM answer_photos
                WHERE ap.answer_id = a.answer_id),
                jsonb_build_array()
              )
            )
          )
        ELSE jsonb_build_array()
        END) AS answers
      FROM questions q
      LEFT JOIN answers a
      ON q.question_id = a.question_id
      LEFT JOIN answer_photos ap
      ON ap.answer_id = a.answer_id
      WHERE q.product_id = $1 AND a.answer_id IS NOT NULL
      AND q.reported = false
      GROUP BY q.question_id
      LIMIT $2)
      SELECT *
      FROM questionsJSON;`

  const questions = await client.query(queryString, [productID, count])
  // console.log(questions.rows);
  return {
    product_id: productID,
    results: questions.rows
  }

}

export const getAnswers = async (questionID: string, count: number) => {
  const queryString = `SELECT a.answer_id, a.answer_body AS body, a.answer_date AS date, a.answerer_name AS name, a.helpful AS helpfulness,
    (CASE WHEN string_agg(ap.url, ',') IS NOT NULL THEN
      jsonb_agg(
        jsonb_build_object(
          'id', ap.photo_id,
          'url', ap.url
        )
      )
    ELSE jsonb_build_array()
    END) AS photos
    FROM answers a
    LEFT JOIN answer_photos ap
    ON ap.answer_id = a.answer_id
    WHERE a.reported = false AND a.question_id = $1
    GROUP BY a.answer_id
    ORDER BY a.answer_id
    LIMIT $2;`
  const answers = await client.query(queryString, [questionID, count])
  return {
    question: questionID,
    page: 1,
    count,
    results: answers.rows
  }
}

export const postQuestion = (productID: number, body: string, name: string, email: string) => {
  const queryString = 'INSERT INTO questions(product_id, question_body, asker_name, asker_email) \
                      VALUES ($1, $2, $3, $4);'
  return client.query(queryString, [productID, body, name, email]);
}


export const postAnswer = (questionID: string, body: string, name: string, email: string, photos: string) => {
  const queryString = 'WITH insAnswer AS (\
                        INSERT INTO answers(question_id, answer_body, answerer_name, answerer_email) \
                        VALUES ($1, $2, $3, $4) \
                        RETURNING answer_id\
                      ) \
                      INSERT INTO answer_photos(answer_id, url)\
                      VALUES ((SELECT answer_id FROM insAnswer), $5);'
  return client.query(queryString, [questionID, body, name, email, photos])
}

export const putQuestionHelpful = async (questionID: string) => {
  const queryString = 'UPDATE questions SET helpful = helpful + 1 WHERE questions.question_id = $1;'
  try {
    const putSuccess = await client.query(queryString, [questionID])
    return putSuccess
  } catch (err) {
    console.log(err);
  }
}

export const putQuestionReport = async (questionID: string) => {
  const queryString = 'UPDATE questions SET reported = true WHERE questions.question_id = $1;'
  try {
    const putSuccess = client.query(queryString, [questionID]);
  } catch (err) {
    console.log(err);
  }
}

export const putAnswerHelpful = async (answerID: string) => {
  const queryString = 'UPDATE answers SET helpful = helpful + 1 WHERE answers.answer_id = $1;'
  try {
    const putSuccess = await client.query(queryString, [answerID])
  } catch (err) {
    console.log(err);
  }
}

export const putAnswerReport = async (answerID: string) => {
  const queryString = 'UPDATE answers SET reported = true WHERE answers.answer_id = $1;'
  try {
    const putSuccess = client.query(queryString, [answerID]);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  client,
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  putQuestionReport,
  putQuestionHelpful,
  putAnswerReport,
  putAnswerHelpful
};


// jsonb_build_object(
//   "question", 5,
//   "page", 1,
//   "count", 5,
//   "results", jsonb_agg()

// SELECT a.answer_id, a.answer_body AS body, a.answer_date AS date, a.answerer_name AS name, a.helpful AS helpfulness,
//     (CASE WHEN string_agg(ap.url, ',') IS NOT NULL THEN
//       jsonb_agg(
//         jsonb_build_object(
//           'id', ap.photo_id,
//           'url', ap.url
//         )
//       )
//     ELSE jsonb_build_array()
//     END) AS photos
//     FROM answers a
//     LEFT JOIN answer_photos ap
//     ON ap.answer_id = a.answer_id
//     WHERE a.reported = false AND a.question_id = 5
//     GROUP BY a.answer_id
//     ORDER BY a.answer_id
//     LIMIT 5;

//we are writing one SELECT clause for the questions and answers query

// WITH photosJSON AS (
//   SELECT json_agg(answer_photos.url)
//   FROM answers a
//   INNER JOIN answer_photos
//   ON answer_photos.answer_id = a.answer_id
//   WHERE answer_photos.answer_id = a.answer_id
// ),


// WITH questionsJSON AS (
// SELECT q.question_id, question_body, question_date, asker_name, q.reported, q.helpful,
//   (CASE WHEN (
//     string_agg(a.answer_id::varchar, ',' ORDER BY a.answer_id DESC)
//     ) IS NOT NULL THEN
//     jsonb_object_agg(a.answer_id::integer,
//       jsonb_build_object(
//         'id', a.answer_id,
//         'body', a.answer_body,
//         'date', a.answer_date,
//         'answerer_name', a.answerer_name,
//         'helpfulness', a.helpful,
//         'photos', COALESCE
//         (
//           (SELECT jsonb_agg(answer_photos.url)
//           FROM answer_photos
//           WHERE ap.answer_id = a.answer_id),
//           jsonb_build_array()
//         )
//       )
//     )
//   ELSE jsonb_build_object()
//   END) AS answers
// FROM questions q
// LEFT JOIN answers a
// ON q.question_id = a.question_id
// LEFT JOIN answer_photos ap
// ON ap.answer_id = a.answer_id
// WHERE q.product_id = 3 AND a.answer_id IS NOT NULL
// AND q.reported = false
// GROUP BY q.question_id
// ORDER BY q.question_id
// LIMIT 3
// OFFSET 1)
// SELECT jsonb_pretty(jsonb_build_object(
//   'product_id', 3,
//   'results', jsonb_agg(questionsJSON.*)))
// FROM questionsJSON;



/*

//get answers data

WITH cte_questions AS (
  SELECT q.question_id, question_body, question_date, asker_name, q.helpful AS question_helpfulness, q.reported,
  json_agg(row_to_json(a.*, true))
  FROM questions q
  LEFT JOIN answers a ON q.question_id = a.question_id
  WHERE product_id = 3 AND q.reported = false
  GROUP BY q.question_id
  LIMIT 20
  )
select * from cte_questions;

  cte_answers AS (
    SELECT answer_id AS id, answer_body AS body, answerer_name, helpful AS helpfulness
    FROM answers AS a
    WHERE reported = false
    AND
    LIMIT 3
  ),



  select exists(
    select a.question_id from questions q inner join answers a on a.question_id = q.question_id where q.product_id = 3 and not exists
    (select question_id from answers a where a.question_id = q.question_id)
  );
*/