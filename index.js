const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()

const userDatabase=[]
const userListing={}
const exercisesDatabase={}
//Test Area






app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Getting User Info
app.post('/api/users',(req, res)=>{
  const { username } = req.body;
  const bytes = crypto.randomBytes(8);
  const id = bytes.toString('hex');
  const user={
    _id:id,
    username:username
  }
  userDatabase.push(user)
  userListing[id]=username;
  console.log(userListing)
  res.json({username:username,_id:id});
})

//Displaying User Info
app.get('/api/users',(req, res)=>{
  res.json(userDatabase);
})

//Getting User Exercises
app.post('/api/users/:_id/exercises',(req, res)=>{
  // console.log(req.body)
  const { _id } = req.params;
  const { description , duration } = req.body;
  let { date } = req.body
  if(!date){
    const today = new Date();
    const year = today.getFullYear(); // Get the current year (e.g., 2023)
    const month = (today.getMonth() + 1).toString().padStart(2,'0'); // Get the current month (0-indexed, so add 1)
    const day = today.getDate().toString().padStart(2,'0'); // Get the current day of the month
    date=`${year}-${month}-${day}`;
  }
  const exercise={
    description: description,
    duration: parseInt(duration),
    date: date
  };
  if(!exercisesDatabase[_id]){
    exercisesDatabase[_id]=[]
  }
  exercisesDatabase[_id].push(exercise);
  const currentUser = userListing[_id]
  console.log(exercisesDatabase)
  res.json({_id:_id,username:currentUser,date:date,duration:duration,description:description})
})

//Displaying User logs
app.get('/api/users/:_id/logs',(req, res)=>{
  const { _id } = req.params;
  const username = userListing[_id];
  let logs = exercisesDatabase[_id];

  const fromDate = req.query.from;
  const toDate = req.query.to;
  const limit = parseInt(req.query.limit);
  if (fromDate) {
    logs = logs.filter((log) => log.date >= fromDate);
  }

  if (toDate) {
    logs = logs.filter((log) => log.date <= toDate);
  }
  const count = logs.length;

  if (limit) {
    logs = logs.slice(0, limit);
  }
  res.json({_id:_id,username:username,count:count,log:logs});
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
