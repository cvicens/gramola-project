const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/my-uploads';

const multer  = require('multer');
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage })

function route() {
  let router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.post('/upload', upload.single('image'), (req, res, next) => {
    console.log('body', JSON.stringify(req.body));
    console.log('file', JSON.stringify(req.file));
    res.status(200).json({result: 'success', message: 'File uploaded successfully'});
  });

  // Finding an event by eventId, userId, ...
  router.get('/:fileId', function(req, res) {
    let fileId = req.params.fileId;
    console.log('Read image with fileId', fileId);
    if (typeof fileId === 'undefined' || fileId == '') {
      res.status(400).json([]);
    }

    res.sendFile(UPLOAD_DIR + '/' + fileId);
    
  });

  return router;
}

module.exports = route;