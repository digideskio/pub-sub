Setup:

$ mongo
> use pubsub
> db.createCollection('messages', { capped: true, size: 100000 })
> db.messages.insert({})

Subscribe:

$ nodemon subscribe.js

Publish:

$ mongo
> use pubsub
> db.messages.insert({ message: 'Hello world', time: Date.now() }) 
