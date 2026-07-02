require('dotenv').config();
const { analyzeText } = require('./src/adapters/nlpAdapter');

async function test() {
  try {
    const res = await analyzeText("chile envio ayuda humanitaria por el terremoto sucedido en venezuela y tuvieron problemas con la policia de allá porque les pedian credenciales por si eran espias.");
    console.log("Result:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
