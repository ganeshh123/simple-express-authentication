let crypto = require('crypto')
let bcrypt = require('bcrypt')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')

app.use(cookieParser())

/* Sample Object to Simulate Database Entries */
let userDocuments = {
    "b837e03bbd6f554480b8" : {
        "id": "b837e03bbd6f554480b8",
        username: "user1",
        "password": "$2b$12$1NPTqWHFfkIXaNB7IM4XUOSOsvhn796lnaA2tDDxThU1YOBYrTYcu",
        "bio" : "I am user 1",
        "tokens": []
    }
}

/* Redirects to Login if invalid token */
let authenticate = (request, response, next) => {
    if(request.cookies && request.cookies['userId'] && request.cookies['localToken']){
        
        /* TODO - Database logic to retrieve user document using id from cookie */
        let userDocument = userDocuments[request.cookies['userId']]
        /* ------- */

        // If user document's list of valid tokens includes our local token then continue
        if(userDocument && userDocument.tokens.includes(request.cookies['localToken'])){
            console.log('Token Authenticated for ' + userDocument.username)
            return next()
        }
    }
    
    // If token doesn't exist or is invalid, then redirect to login
    return response.redirect('/login')
}

let authenticationRoutes = (app) => {

    app.get('/register', (request, response) => {

        /* Redirect if already logged in */
        if(request.cookies['userId'] && request.cookies['localToken']){
            let userDocument = userDocuments[request.cookies['userId']]
            console.log(userDocument)
            if(userDocument && userDocument.tokens.includes(request.cookies['localToken'])){
                console.log('Token Authenticated for ' + userDocument.username)
                return response.redirect('/authenticated-page')
            }
        }

        return response.sendFile(process.cwd() + '/register.html')
    })

    app.post('/register', bodyParser.urlencoded({ extended: false }), (request, response) => {
        let id = crypto.randomBytes(10).toString('hex')
        let username = request.body.username
        let password = bcrypt.hashSync(request.body.password, 12)
        let bio = request.body.bio

        /* Redirect to login if user already exists */
        let userDocument = Object.entries(userDocuments).find((entry) => {
            return entry[1].username == request.body.username
        })
        if(userDocument){
            return response.json("User Already Exists")
        }

        /* Add your own database logic here */
        userDocuments[id] = {
            id: id,
            username: username,
            password: password,
            bio: bio,
            tokens: []
        }
        console.log(username + " registered")
        console.log(userDocuments)
        /* ------- */

        return response.redirect('/login')

    })

    app.get('/login', (request, response) => {
        
        /* Redirect if already logged in */
        if(request.cookies['userId'] && request.cookies['localToken']){
            let userDocument = userDocuments[request.cookies['userId']]
            console.log(userDocument)
            if(userDocument && userDocument.tokens.includes(request.cookies['localToken'])){
                console.log('Token Authenticated for ' + userDocument.username)
                return response.redirect('/authenticated-page')
            }
        }

        return response.sendFile(process.cwd() + '/login.html')
    })

    app.post('/login', cookieParser(), bodyParser.urlencoded({ extended: false }), (request, response) => {

        /* Database Logic to Retrieve User Document from Username */
            let userDocument = Object.entries(userDocuments).find((entry) => {
                return entry[1].username == request.body.username
            })
            if(userDocument){
                console.log('User Found')
                console.log(userDocument)
                userDocument = userDocument[1]
            }
        /* ------- */


        if(!userDocument || !bcrypt.compareSync(request.body.password, userDocument.password)){
            return response.redirect('/login')
        }else{
            let generatedToken = crypto.randomBytes(30).toString('hex')
            response.cookie('userId', userDocument.id)
            response.cookie('localToken', generatedToken)

            /* Add Database Logic to push token to tokens array */
            userDocument.tokens.push(generatedToken)
            console.log(userDocument.username + ' logged in')
            console.log(userDocuments)
             /* ------- */
            
            return response.redirect('/authenticated-page')
        }

    })

    app.get('/logout', (request, response) => {
        let userDocument = userDocuments[request.cookies['userId']]
        userDocument.tokens = userDocument.tokens.filter((token) => {
            token != request.cookies['localToken']
        })
        request.cookies['userId'] = undefined
        request.cookies['localToken'] = undefined

        console.log(userDocument.username + " logged out")
        console.log(userDocuments)

        return response.redirect('/login')
    })

}

module.exports = {
    authenticationRoutes: authenticationRoutes,
    authenticate: authenticate
}