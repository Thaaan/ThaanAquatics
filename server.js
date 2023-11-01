const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const itemRoutes = require('./db/item.routes.js');

app.use(express.json());  // To parse JSON bodies
app.use('/api', itemRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  const open = await import('open');
  open.default(`http://localhost:${port}`);
  console.log()
});
