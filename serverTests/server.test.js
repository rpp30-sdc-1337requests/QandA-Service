const {
  client,
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  putQuestionReport,
  putQuestionHelpful,
  putAnswerReport,
  putAnswerHelpful
} = require('../Server/dist/database');

const axios = require('axios');

describe('initiate', () => {
  it('there is an active test suite', () => {
    expect(true).toBe(true);
  })
})

describe('querying the questions table returns an array of results', () => {
  it('contains 10 results when we select 10 questions', () => {
    client.query('SELECT * FROM questions LIMIT 10', (err, res) => {
      expect(res.rowCount).toBe(10)
    })
  })
})


describe('querying the answers table returns an array of results', () => {
  it('contains 10 results when we select 10 answers', async () => {
    const res = await client.query('SELECT * FROM answers LIMIT 10')
    // console.log('test response', res)
    client.end();
  })
})

describe('we are provided the requisite API from the server', () => {
  it('has a results property containing answers', async () => {
    const ans = await axios.get(`http://localhost:8080/qa/questions/5/answers`, {params: {page: 1, count: 5}})
    // console.log('hereeee', ans.data)
    expect(ans.data.results.length).toBeGreaterThanOrEqual(1)
  })
  it('has a results property containing 5 questions for the product id 50', async () => {
    const ans = await axios.get(`http://localhost:8080/qa/questions/?product_id=50`, {params: {page: 1, count: 5}})
    // console.log('hereeee', ans.data)
    expect(ans.data.results.length).toEqual(5);
  })
  it('will mark questions and answers as helpful', async () => {
    const response = await axios.put(`http://localhost:8080/qa/questions/5/helpful`, {question_id: 3})
    console.log('hereeee', response)
    expect(response.data).toEqual('UPDATE');
  })
})