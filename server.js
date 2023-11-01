const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  const open = await import('open');
  open.default(`http://localhost:${port}`);
});
