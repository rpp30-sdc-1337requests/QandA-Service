import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '50s', target: 50 },
    { duration: '10s', target: 0 }
  ]
}

const getRandom = () => {
  return Math.floor(Math.random() * (99999 - 10000) + 10000);
}

export default function () {
  const lastTen = '9' + getRandom();
  http.get(`http://localhost:8080/qa/questions?product_id=${lastTen}`);
}
