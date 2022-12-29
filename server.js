const appname = "SMSreceiver";
const swaggerUi = require('swagger-ui-express');    //generate dosc API from file swagger.json
const http = require('http');
const Route =require('./route.js');
const swaggerJsDoc=require('swagger-jsdoc');
const OpenApiValidator = require('express-openapi-validator');
const dateNow=()=>{ return new Date(Date.now()).toISOString().replace(/T/, ' ').replace(/Z/,'')}; //for logs

//Server
const express = require('express')
const app = express()
const port= process.env.PORT || 8080;
server = http.createServer(app)

app.use(express.json());

//openApi configuration
const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SMS receiver',
        version: '1.1.0',
      },
    },
    apis: ['./route.js'], // files containing annotations as above
  };  
const apiSpec = swaggerJsDoc(options);

app.get(`/${appname}/swagger.json`, (_req, res) => res.json(apiSpec));
app.use(`/${appname}/swagger`, swaggerUi.serve, swaggerUi.setup(apiSpec));

// validation middleware
app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests: true, // (default)
      //validateResponses: true, // false by default
    }),
  );

// error handler
app.use((err, req, res, next) => {
  console.log('\n',dateNow(),`validation error - req.body:${JSON.stringify(req.body)}`);
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});


//endpoint
app.use(Route)

app.listen(port)