// const Kit = require('@celo/contractkit')
// const CeloContract = Kit.CeloContract
// const kit = Kit.newKit('http://localhost:8545')
var express = require('express');
const fs = require('fs');
const parse = require('csv-parse/lib/sync')
var teams = require('./teams.json');

// async function wrapper(){

//     let accounts = await kit.web3.eth.getAccounts()
//     let balance = await kit.getTotalBalance(accounts[0])

//     const goldTokenAddress = await kit.registry.addressFor(CeloContract.GoldToken)
//     const stableTokenAddress = await kit.registry.addressFor(CeloContract.StableToken)
//     const registryAddress = await kit.registry.addressFor(CeloContract.Registry)
//     const validatorsAddress = await kit.registry.addressFor(CeloContract.Validators)

//     console.log("Accounts: ", accounts)

//     for (let [key, value] of Object.entries(balance)) {
//         console.log(`${key}: ${value.toString(10)}`);
//     }

//     console.log("Gold Token Address: ", goldTokenAddress)
//     console.log("Stable Token Address: ", stableTokenAddress)
//     console.log("Registry Address: ", registryAddress)    
//     console.log("Validators Address: ", validatorsAddress)
// }


// wrapper();

const getGameData = () => {
    const path = `${__dirname}/TeamGame.2020.csv`;
    let gameData;
    try{
      if (fs.existsSync(path)) {
        //file exists
        gameData = fs.readFileSync(path);
      }
    } catch(err) {
      console.error(err)
    }
    return parse(gameData, {
        columns: true,
        skip_empty_lines: true
      });
};

const games = getGameData();
 var app = module.exports = express();
 
 // create an error with .status. we
 // can then use the property in our
 // custom error handler (Connect repects this prop as well)
 
 function error(status, msg) {
   var err = new Error(msg);
   err.status = status;
   return err;
 }
 
 // if we wanted to supply more than JSON, we could
 // use something similar to the content-negotiation
 // example.
 
 // here we validate the API key,
 // by mounting this middleware to /api
 // meaning only paths prefixed with "/api"
 // will cause this middleware to be invoked
 
 app.use('/api', function(req, res, next){
   var key = req.query['api-key'];
 
   // key isn't present
   if (!key) return next(error(400, 'api key required'));
 
   // key is invalid
   if (!~apiKeys.indexOf(key)) return next(error(401, 'invalid api key'));
 
   // all good, store req.key for route access
   req.key = key;
   next();
 });
 
 // map of valid api keys, typically mapped to
 // account info with some sort of database like redis.
 // api keys do _not_ serve as authentication, merely to
 // track API usage or help prevent malicious behavior etc.
 
 var apiKeys = ['dorahacks'];
 
 // we now can assume the api key is valid,
 // and simply expose the data
 
 // example: http://localhost:5000/api/games/?api-key=dorahacks
 app.get('/api/games', function(req, res, next){
   res.send(games);
 });

  // example: http://localhost:5000/api/games/17267?api-key=dorahacks
  app.get('/api/games/:scoreID/:quarter', function(req, res, next){
    var scoreId = req.params.scoreID;
    var quarter = req.params.quarter;
    var game = games.find(game => {
        return game.ScoreID === scoreId;
   });
    res.send(game);
  });
 
 // example: http://localhost:5000/api/teams/?api-key=dorahacks
 app.get('/api/teams', function(req, res, next){
   res.send(teams);
 });
 
 // example: http://localhost:5000/api/teams/ATL?api-key=dorahacks
 app.get('/api/teams/:name', function(req, res, next){
   var name = req.params.name;
   var team = teams.find(team => {
        return team.Key === name;
   });
 
   if (team) res.send(team);
   else next();
 });
 
 // middleware with an arity of 4 are considered
 // error handling middleware. When you next(err)
 // it will be passed through the defined middleware
 // in order, but ONLY those with an arity of 4, ignoring
 // regular middleware.
 app.use(function(err, req, res, next){
   // whatever you want here, feel free to populate
   // properties on `err` to treat it differently in here.
   res.status(err.status || 500);
   res.send({ error: err.message });
 });
 
 // our custom JSON 404 middleware. Since it's placed last
 // it will be the last middleware called, if all others
 // invoke next() and do not respond.
 app.use(function(req, res){
   res.status(404);
   res.send({ error: "Lame, can't find that" });
 });
 
 /* istanbul ignore next */
 if (!module.parent) {
   app.listen(5000);
   console.log('Express started on port 5000');
 }