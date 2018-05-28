var express = require('express')
var app = express()
var path = require('path')
var formidable = require('formidable')
var fs = require('fs')

app.use(express.static(path.join(__dirname, 'public')))

var uploadsDir = path.join(__dirname, 'public/uploads')

var fileListJSONPath = path.join(__dirname, 'fileList.json')

// POST upload
app.post('/upload', function(req, res) {

    // create an incoming form object
    var form = new formidable.IncomingForm()

    form.maxFileSize = '2GB' // default is 200MB

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true

    // store all uploads in the /uploads directory
    form.uploadDir = uploadsDir

    // every time a file has been uploaded successfully,
    // rename it to it's original name
    form.on('file', function(field, file) {
        try {
            fs.rename(file.path, path.join(form.uploadDir, file.name), () => {
                putFileListInJSON()
            })
        } catch(err) {
            console.error(err)
        }
    })

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err)
    })

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('Success!')
    })

    // parse the incoming request containing the form data
    form.parse(req)

})

function getFileListFromFileSystem() {
    function fileList(dir) {
      return fs.readdirSync(dir).reduce(function(list, file) {
        var name = path.join(dir, file)
        var isDir = fs.statSync(name).isDirectory()
        return list.concat(isDir ? fileList(name) : [name])
      }, [])
    }

    var fileNamesList = fileList(uploadsDir).map((file) => file.split(path.sep).slice(-1)[0])
    fileNamesList = fileNamesList.filter(filename => filename !== '.gitignore')
    return fileNamesList;
}

function putFileListInJSON() {
    fs.writeFileSync(fileListJSONPath, JSON.stringify(getFileListFromFileSystem()))
}

function getFileListFromJSON() {
    if (!fs.existsSync(fileListJSONPath)) {
        putFileListInJSON()
    }
    return JSON.parse(fs.readFileSync(fileListJSONPath).toString())
}

// GET File List
app.get('/file-list', function(req, res) {
    return res.json(getFileListFromJSON())
})

// DELETE File
app.post('/delete-file/:filename', function(req, res) {
    var file = path.join(uploadsDir, req.params.filename)
    fs.stat(file, function(err, stat) {
        if(err == null) {
            fs.unlink(file, function() {
                putFileListInJSON()
                res.send("File Deleted!")
            })
        } else {
            res.status(500).send('File not found!');
        }
    })
})

// bring to life
app.listen(9871, function(){
    console.log('Listening at: http://localhost:9871')
})