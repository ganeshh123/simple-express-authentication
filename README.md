# Simple Express Authentication
Dead simple manual authentication for Express Apps - No Passport Required!

## Requirements

### Dependencies

- Express
- Bcrypt
- Body-Parser
- Cookie-Parser

### Database Requirements

- User Documents must have an array to store tokens (strings)
- User Documents must have a unique ID
- User Documents must have a unique field (currently username, maybe swap for email)

## Setup

1. Clone/Download the repository and import `auth.js` and optionally `login.html` and `register.html` to your project
2. Import the `authenticate` function and the `authenticationRoutes` function, and run `authenticationroutes` and give it your express app:

    ```bash
    let authenticationRoutes = require('./auth').authenticationRoutes
    let authenticate = require('./auth').authenticate

    authenticationRoutes(app)
    ```

3. Tweak `auth.js` as desired, and add in the Database Logic

## Features

### Included

- Password Hashing with Bcrypt

### Not Yet Implemented

- Messages to display error messages to users
- Editing Registration Data from Client Side