const multer = require('multer');

let path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname , '..' ,'/public/videos'))
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
})

var upload = multer({
    storage:storage,
    fileFilter: function(req, file , cb){
        checkFileType(file, cb);
    }
})


function checkFileType(file , cb){
    const fileTypes = /mp4|mov|mkv|webm/
    console.log(path.extname(file.originalname))
    const extname = fileTypes.test( path.extname(file.originalname).toLowerCase());
    const minetype = fileTypes.test(file.mimetype);
    if(minetype && extname) {
        return cb(null, true);
    }else{
        cb('Error: Vidios Only!')
    }
}

module.exports = upload;