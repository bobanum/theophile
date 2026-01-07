import _ from 'lodash';
import './App.js';
const arr = [1, 2, 3, 4, 5, 6];
const chunks = _.chunk(arr, 2);

const root = document.getElementById('app');
if (root) {
  root.textContent = `Chunks: ${JSON.stringify(chunks)}`;
} else {
  console.log('Chunks:', chunks);
}


