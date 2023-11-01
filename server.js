const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const itemRoutes = require('./server/db/item.routes.js');

app.use(express.json());  // To parse JSON bodies
app.use('/products', itemRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/server/views'));

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  const open = await import('open');
  open.default(`http://localhost:${port}`);
  console.log()
});
