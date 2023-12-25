UPDATE 10/12/2023

* setup the files deleted custome made function globally in the custom made global error handler since the global error handler will ultimately contain the req object of every route handler, so the situation where the files uploaded by the user were getting saved in the local-storage even while we didn't want and even upon sending an api error was solved by this. And it spared me to use that file-delete-function with the every error being thrown.


UPDATE 14/12/2023

* Made possible the revocation/invalidation of the previously sent jwt access and refresh tokens by implementing the versioning system by using uuid for a unique identifier to be saved in the payload of JWT and in the property of req.session object which property shall be further accessed in the authentication middleware to verify the equality of versioning set in the payload and in the req.session object.

* Made an endpoint for issuing the fresh access tokens by getting the refresh token from the user with a middleware to first verify the version of refresh token and then calling the next() for issuing the access-token to the user.

UPDATE 16/12/2023

* Made the endpoint for reseting the password and upon successful reseting of password invalidating the tokens issued before along with sending the link to the user for the same on his email and used the service MAILTRAP+NODEMAILER 

UPDATE 18/12/2023

* Implemented using Redis for storing the versioning instead of storing it in the req.session's memory storage.

UPDATE 19/12/2023 

* As redis has turned out to be unreliable approach since redis will be getting used just for maintaing cache with some expiry for the fast response of data having keys with unique id of the user for multi user usage.
YET TO IMPLEMENT THE ABOVE

* Made changes and added two new field in the user schema for storing the versioning of tokens in and for multi-user support of invalidating the tokens (req.session does the same as its unique to every user).

UPDATE 25/12/2023

*After making some additional routes and apis for the users, I decided to make some changes where all of the routes related to the user will be used at once in app.use()- just make sure to write the route whose last field of the path is expecting a route parameter on last else it will be invoked inadvertently, also make sure to choose the correct http method for other requests else again this will be invoked inadvertently. or just let the files be separate.