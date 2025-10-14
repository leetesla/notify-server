var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST /debot-signals */
router.post('/debot-signals', function(req, res, next) {
  console.log('Received POST request at /debot-signals');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  // 返回成功响应
  res.status(200).json({ 
    message: 'Request received successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;