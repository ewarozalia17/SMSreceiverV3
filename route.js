const express = require('express');
const pass = process.env.PASS || "SADMIN";
const soap = require('soap');
const url = process.env.WSDL || './TBC_CaseManager_WS_UAT.WSDL';

/**
 * @openapi
 * components:
 *   schemas:
 *     SMSobject:
 *       type: object
 *       properties:
 *          gatewayNumber:
 *              type: string
 *              maxLength: 20
 *          senderNumber:
 *              type: string
 *              maxLength: 20
 *          message:
 *              type: string
 *              maxLength: 1333
 *       required: [ gatewayNumber, senderNumber, message ]
 */

const Route=express.Router();

/**
 * @openapi
 * /:
 *  post:
 *      summary: Response send by client
 *      tags:
 *          - SMS
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/SMSobject'
 *      responses:
 *          "200":
 *              description: successful operation
 *          "400":
 *              description: one or more validation errors occured
 *          "500":
 *              description: internal server error
 */

Route.post('/',(req,res)=>{
    let timestamp = new Date(Date.now()).toISOString().replace(/T/, ' ').replace(/Z/,'');
    console.log("\n\n",timestamp, "new SMS received: %j", req.body);
    let body = req.body;
    console.time(timestamp + "\tSoap API took");
    
    //Create promise
    let getPromise=new Promise(function(getResolve,getReject){

        const options={
            hasTimeStamp : false,
            hasTokenCreated: false
        }
        soap.createClient(url, function (err, client) {
            if (err == null) {
                client.setSecurity(new soap.WSSecurity('SADMIN', pass, options));
                client.TBC_CaseManager_WSRegisterSMS(body, function (error, result) {
                    if (error == null) {
                        console.log(timestamp + "\t" +"body %j",body, " WSDL response "+ JSON.stringify(result));
                        getResolve("OK");
                    } else {
                        console.error(timestamp +"\t"+"/ERROR in TBC_CaseManager_WS.WSDL"+"\n"+"body %j",body,"\n",error);
                        console.log(timestamp+"\t"+ "/ERROR in TBC_CaseManager_WS.WSDL"+" for %j",body);
                        getReject(500);   // when error
                    }
                });
    
            } else {
                console.error(timestamp + "\tERROR creating soap client\n" + " for ",body ,"\n",err);
                console.log(timestamp + "\tERROR creating soap client\n" + " for ",body);
                getReject(500);   // when error
            }
        })
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    getPromise.then(
        function(result){
            res.send(result);
            console.log(timestamp, body, "sent response", result)},
        function(err){res.sendStatus(500)
            console.log(timestamp, body, "sent response : 500")},
    )

    console.timeEnd(timestamp + "\tSoap API took");
})

module.exports=Route;