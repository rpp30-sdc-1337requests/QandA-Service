import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '50s', target: 100 },
    { duration: '10s', target: 0 }
  ]
}

const getRandom = () => {
  const min = Math.ceil(10000);
  const max = Math.floor(99999);
  return Math.floor(Math.random() * (max - min) + min);
}

export default function () {
  const lastTen = '9' + getRandom();
  http.get(`http://localhost:8080/qa/questions?product_id=${lastTen}`);
  // sleep(1);
}
