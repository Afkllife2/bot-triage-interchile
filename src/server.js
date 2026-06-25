const app = require("./app");

const port = Number(process.env.PORT || 3005);

app.listen(port, () => {
  console.log(`Bot Verificador X prototype running on http://localhost:${port}`);
});
