let crypto = require('crypto')
let bcrypt = require('bcrypt')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')



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

    app.use(cookieParser())

    app.get('/register', (request, response) => {

        /* TODO - Database logic to check if local token is in valid list of
            tokens in user document and redirect. Prevents users from registeringtwice.
        */
        if(request.cookies['userId'] && request.cookies['localToken']){
            let userDocument = userDocuments[request.cookies['userId']]
            console.log(userDocument)
            if(userDocument && userDocument.tokens.includes(request.cookies['localToken'])){
                // If already valid token, redirect to desired page
                console.log('Token Authenticated for ' + userDocument.username)
                return response.redirect('/authenticated-page')
            }
        }
         /* ------- */

        // Load Registration Form
        return response.sendFile(process.cwd() + '/pages/register.html')
    })

    app.post('/register', bodyParser.urlencoded({ extended: false }), (request, response) => {
        let id = crypto.randomBytes(10).toString('hex')
        let username = request.body.username
        let password = bcrypt.hashSync(request.body.password, 12)
        let bio = request.body.bio

        /* TODO - Check for already existing unique properties in the database
            and respond as required.
        */
        let userDocument = Object.entries(userDocuments).find((entry) => {
            return entry[1].username == request.body.username
        })
        if(userDocument){
            return response.json("User Already Exists")
        }
        /* ------- */

        /* TODO - Database Logic to create user document in database */
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

        // Redirect to Login after Registration
        return response.redirect('/login')

    })

    app.get('/login', (request, response) => {
        
        /* TODO - Database logic to check if local token is in valid list of
            tokens in user document and redirect. Prevents users from logging in twice.
        */
        if(request.cookies['userId'] && request.cookies['localToken']){
            let userDocument = userDocuments[request.cookies['userId']]
            console.log(userDocument)
            if(userDocument && userDocument.tokens.includes(request.cookies['localToken'])){
                // If already valid token, redirect to desired page
                console.log('Token Authenticated for ' + userDocument.username)
                return response.redirect('/authenticated-page')
            }
        }
        /* ------- */

        // Send Login Form
        return response.sendFile(process.cwd() + '/pages/login.html')
    })

    app.post('/login', cookieParser(), bodyParser.urlencoded({ extended: false }), (request, response) => {

        /* TODO - Database Logic to Retrieve User Document from Username */
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
            // If User not found in database or given password doesn't match the hash, redirect to login
            return response.redirect('/login')
        }else{
            // Generate a Token and store into cookie with User ID
            let generatedToken = crypto.randomBytes(30).toString('hex')
            response.cookie('userId', userDocument.id)
            response.cookie('localToken', generatedToken)

            /* Add Database Logic to push token to tokens array */
            userDocument.tokens.push(generatedToken)
            console.log(userDocument.username + ' logged in')
            console.log(userDocuments)
             /* ------- */
            
            // Redirect to desired page after a successful login
            return response.redirect('/authenticated-page')
        }

    })

    app.get('/logout', (request, response) => {

        /* TODO - Database logic to delete the cookie token from
            user document's list of valid tokens
        */
        let userDocument = userDocuments[request.cookies['userId']]
        userDocument.tokens = userDocument.tokens.filter((token) => {
            token != request.cookies['localToken']
        })
         /* ------- */

        // Remove tokens from cookie - not really needed tbh
        request.cookies['userId'] = undefined
        request.cookies['localToken'] = undefined

        console.log(userDocument.username + " logged out")
        console.log(userDocuments)

        // Redirect as desired after signing out
        return response.redirect('/login')
    })

}

module.exports = {
    authenticationRoutes: authenticationRoutes,
    authenticate: authenticate
}