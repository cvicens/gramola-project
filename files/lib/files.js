const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/my-uploads';

const mime = require('mime-types')
const uuidv4 = require('uuid/v4');

const multer  = require('multer');
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: function (req, file, cb) {
    console.log('req.body.naming_strategy', req.body);
    // If original naming strategy
    if (req.body.naming_strategy && req.body.naming_strategy === 'original' &&
        file.originalname !== undefined && file.originalname.length > 0) {
      cb(null, file.originalname);
      return;
    }
    // Random name
    const extension = mime.extension(file.mimetype);
    const filename = uuidv4() + '.' + extension;
    cb(null, filename);
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
    res.status(200).json({result: 'success', filename: req.file.filename});
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