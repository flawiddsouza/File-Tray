let app = require('./app')
const port = process.env.PORT || 9871
app.listen(port, function(){
    console.log(`Listening at: http://localhost:${port}`)
})
