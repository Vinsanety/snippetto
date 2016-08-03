var express = require('express');
var router = express.Router();
var httpRequest = require('fd-http-request')
var request = require('request')
var Traffic = require('../lib/queries')

router.post('/setAddress', function(req, res, next) {
  Traffic.selectUser(req.body.id).then(function(condition){
    if(condition.rowCount != 0){
      Traffic.updateAddress(req.body).then(function(){
        res.send('address updated');
      });
    }else{
      Traffic.saveAddress(req.body).then(function(){
        res.send('address saved');
      });
    }
  })
});

router.post('/getTraffic', function(req, res, next) {
  request('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Lonetree,CO&destinations=Denver,CO&key=AIzaSyCx0Ga7DUSfnNyk8Am0sipc2lJ1EFTHIg0', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    }
  })

});

module.exports = router;