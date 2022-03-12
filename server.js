const express = require('express');
const fs = require('fs')
const path = require('path');
const { clog } = require('./middleware/clog');
const { v4: uuidv4 } = require('uuid');
const { readAndAppend, readFromFile } = require('./helpers/fsUtils');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(clog);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
      } else {
        res.status(200).json(data);
          console.log(data);
      }
  });
});

app.post('/api/notes', (req, res) => {
  console.log(req.body)

    let { title, text } = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuidv4(),
      };
  
      readAndAppend(newNote, './db/db.json');
      res.json(`Tip added successfully 🚀`);
    } else {
      res.error('Error in adding tip');
    }
});

app.get('/api/notes/:id', (req, res) => {
  const uniqId = req.params.id
  readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
          const outcome = json.filter((note) => note.id == uniqId);
          if (outcome.length > 0) {
            return res.json(outcome)
          }
          else {
            return res.json('No id')
          }
      });
});

//get route for deleting note by id
app.delete('/api/notes/:id', (req, res) => {
  const uniqId = req.params.id
  readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
          const outcome = json.filter((note) => note.id !== uniqId);
          fs.writeFile('./db/db.json', JSON.stringify(outcome, null, 4),
          (err) => err ? console.error(err) : console.log("Deleted note"))
          res.status(200).json("Deleted");
      });
});

// Wildcard route to direct users to index.html
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);