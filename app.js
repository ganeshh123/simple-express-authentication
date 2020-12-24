/* Create Express App*/
let app = require('express')()
app.listen(3000)

/* Mount Authentication Routes */
let authenticationRoutes = require('./auth').authenticationRoutes
let authenticate = require('./auth').authenticate

authenticationRoutes(app)

app.get('/authenticated-page', authenticate, (request, response) => {
    return response.sendFile(process.cwd() + '/pages/authenticated-page.html')
})