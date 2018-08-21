const express = require('express')
const bodyParser = require('body-parser')
const graphqlHTTP = require('express-graphql')
const { default: playground } = require('graphql-playground-middleware-express')

const endpoints = {
  graphql: '/___graphql',
  explore: '/___explore'
}

module.exports = ({ schema, store }) => {
  const app = express()

  app.use(
    endpoints.graphql,
    bodyParser.json(),
    graphqlHTTP({ schema, context: { store }})
  )

  app.get(endpoints.explore, playground({
    endpoint: endpoints.graphql
  }))

  return app
}

module.exports.endpoints = endpoints