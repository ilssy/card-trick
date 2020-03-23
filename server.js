const express = require("express")
const app = express()
const path = require("path")
const bodyParser = require("body-parser")
const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient
const URI =
  process.env.MONGO_URI ||
  "mongodb://heroku_9gbtjhdh:ksb54dmm05r5v1c3qo9nk9dp0j@ds159546.mlab.com:59546/heroku_9gbtjhdh"
const PORT = process.env.PORT || 5000
const DB_NAME = process.env.DB_NAME

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/secret", (req, res) =>
  res.sendFile(path.join(__dirname, "secret.html"))
)

app.post("/secret", (req, res) => {
  MongoClient.connect(URI, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log(err)
    } else {
      const db = client.db(DB_NAME)
      const collection = db.collection("names")
      const entry = {
        name: req.body.name.toLowerCase(),
        card: req.body.number + "_of_" + req.body.suit
      }
      collection.insertOne(entry, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.send("Inserted into database :)")
        }
      })
      client.close()
    }
  })
})

app.get("/:param*", (req, res) => {
  const name = req.url.slice(1).toLowerCase()

  MongoClient.connect(URI, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log(err)
    } else {
      const db = client.db(DB_NAME)
      const collection = db.collection("names")

      if (name === "deleteall") {
        collection.remove({})
        res.send("Database reset")
      } else {
        collection.find({ name: name }).toArray((err, result) => {
          if (err) {
            console.log(err)
          } else if (result.length) {
            const card = result[result.length - 1].card + ".png"
            res.sendFile(path.join(__dirname + "/cards/" + card))
          } else {
            resizeTo.sendStatus(404)
          }

          client.close()
        })
      }
    }
  })
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
