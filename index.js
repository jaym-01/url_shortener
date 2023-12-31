const express = require("express");
const path = require('path')
const app = express();
require("dotenv").config();
const bp = require('body-parser');
const dns = require('dns');

// stores all of the urls
var current_num = 0;
var urls = new Map();

app.use("/frontend/", express.static(__dirname + "/frontend"));

app.use((req, res, next)=>{
    console.log(req.method + " | " + req.url);
    next();
})

// use the body-parser middleware
app.post("/api/shorturl", bp.urlencoded({extended: false}), (req, res)=>{

    // validate url
    // make sure the data exists
    if(req.body != null && req.body.url_d != null){
        var og_url = req.body.url_d.toString();
        var url_d = req.body.url_d.toString();

        // console.log(url_d);

        // isolate the domain name
        
        // remove http or https
        if(url_d.length > 8){
            if(url_d.substring(0, 7) == "http://"){
                url_d = url_d.substring(7, url_d.length);
            }
            else if(url_d.substring(0, 8) == "https://"){
                url_d = url_d.substring(8, url_d.length);
            }
        }
        else{
            res.json({error: "invalid url"});
            return;
        }

        // remove the end part of the url
        // to isolate the domain name
        var url_contents = url_d.split("/");

        if(url_contents.length < 1){
            res.json({error: "invalid url"});
            return;
        }

        var dn = url_contents[0];

        // console.log(dn);

        // check if the domain name exists
        dns.lookup(dn, (err, add)=>{

            // console.log(err);

            if (err) res.json({error: "invalid url"});
            else{
                // rest of the response
                // if a valid url is recieved

                // check if the url is in the map
                if(!urls.has(og_url)){
                    // add url if it is not on the map
                    urls.set(og_url, current_num);
                    current_num++;
                }

                // return the details of the url
                res.json({
                    original_url: og_url,
                    short_url: urls.get(og_url),
                });
            }

        });
    }
    else{
        res.json({error: "invalid url"});
        return;
    }
});

app.get("/api/shorturl/:urlid", (req, res)=>{
    var urlid = req.params.urlid;
    var found = false;
    urls.forEach((val, key)=>{

        if(val == urlid){
            res.redirect(key);
            found = true;
            return;
        }

    });

    if(!found) res.json({error: "invalid url"});
});

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/frontend/index.html");
});

app.listen(process.env.PORT, ()=>console.log("listening on PORT: " + process.env.PORT));