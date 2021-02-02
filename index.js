"use strict";

let Service, Characteristic, api; 

const _http_base = require("homebridge-http-base");
const http = _http_base.http;
const configParser = _http_base.configParser;
const PullTimer = _http_base.PullTimer;
const notifications = _http_base.notifications;
const MQTTClient = _http_base.MQTTClient;
const Cache = _http_base.Cache;
const utils = _http_base.utils;



const packageJSON = require("./package.json");

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    api = homebridge;

    homebridge.registerAccessory("homebridge-http-every-sensor", "HTTP-EVERY", HTTP_EVERY);
};

function HTTP_EVERY(log, config) {
    this.log = log;
    this.name = config.name;
    this.servis = config.service;
    this.karakter = config.character;
    this.debug = config.debug || false;
    this.CarbonLimit = config.CarbonLimit || 0;
    this.formula = config.formula || "yok";

    if (config.getUrl) {
        try {
            this.getUrl = configParser.parseUrlProperty(config.getUrl);
        } catch (error) {
            this.log.warn("Error occurred while parsing 'getUrl': " + error.message);
            this.log.warn("Aborting...");
            return;
        }
    }
    else {
        this.log.warn("Property 'getUrl' is required!");
        this.log.warn("Aborting...");
        return;
    }

    this.statusCache = new Cache(config.statusCache, 0);
    this.statusPattern = /([0-9]{1,7})/;
    try {
        if (config.statusPattern)
            this.statusPattern = configParser.parsePattern(config.statusPattern);
    } catch (error) {
        this.log.warn("Property 'statusPattern' was given in an unsupported type. Using default value!");
    }
    this.patternGroupToExtract = 1;
    if (config.patternGroupToExtract) {
        if (typeof config.patternGroupToExtract === "number")
            this.patternGroupToExtract = config.patternGroupToExtract;
        else
            this.log.warn("Property 'patternGroupToExtract' must be a number! Using default value!");
    }

  
    
    
    
    this.homebridgeService = new Service[this.servis](this.name); 
     this.homebridgeService.getCharacteristic(Characteristic[this.karakter])
        .on("get", this.getLight.bind(this));
    
    
    
   

  
    /** @namespace config.notificationPassword */
    /** @namespace config.notificationID */
    notifications.enqueueNotificationRegistrationIfDefined(api, log, config.notificationID, config.notificationPassword, this.handleNotification.bind(this));

    /** @namespace config.mqtt */
   
}

HTTP_EVERY.prototype = {

    identify: function (callback) {
        this.log("Identify requested!");
        callback();
    },

    getServices: function () {
        if (!this.homebridgeService)
            return [];

        const informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Robomigo")
            .setCharacteristic(Characteristic.Model, "HTTP Generic Sensor")
            .setCharacteristic(Characteristic.SerialNumber, "RBMG01")
            .setCharacteristic(Characteristic.FirmwareRevision, packageJSON.version);

        return [informationService, this.homebridgeService];
    },

    handleNotification: function(body) {
        const characteristic = utils.getCharacteristic(this.homebridgeService, this.karakter);
        
 if (!characteristic) {
            this.log("Encountered unknown characteristic when handling notification (or characteristic which wasn't added to the service): " + this.karakter);
            return;
        }
        this.comingvalue = parseFloat(body.value);
            this.log("Updating  to new value: " + this.comingvalue);
      
     //   characteristic.updateValue(body.value.trim());
        
        
        if (this.formula != "yok")
            {
           
//result =  eval('('+this.formula+')' );
                this.formulasiri = this.formula.replace("$$$",this.comingvalue);
                this.log("formula is "+ this.formulasiri);   
                this.formulcomingvalue = eval(this.formulasiri);
                this.log("formulated result is "+ this.formulcomingvalue);
                characteristic.updateValue(this.formulcomingvalue);
                
            }
        else {
             characteristic.updateValue(this.comingvalue);
        }
        
        
       
       
        
        if (this.servis == "CarbonDioxideSensor"){
            
            
             const CarbonDioxideDetected = utils.getCharacteristic(this.homebridgeService, "CarbonDioxideDetected");
            if ((parseFloat(body.value) > parseFloat(this.CarbonLimit)) && (this.CarbonLimit >0))
                {
                    CarbonDioxideDetected.updateValue(1);
                }
            else {
                CarbonDioxideDetected.updateValue(0);
            }
            
        }
        
        
         if (this.servis == "CarbonMonoxideSensor"){
            
            
             const CarbonMonoxideDetected = utils.getCharacteristic(this.homebridgeService, "CarbonMonoxideDetected");
            if ((parseFloat(body.value) > parseFloat(this.CarbonLimit)) && (this.CarbonLimit >0))
                {
                    CarbonMonoxideDetected.updateValue(1);
                }
            else {
                CarbonMonoxideDetected.updateValue(0);
            }
            
        }
         
   //  characteristic.setValue(1984);
//    utils.setCharacteristic(Characteristic.CarbonDioxideLevel,1982);
  //   utils.updateCharacteristic(Characteristic.CarbonDioxideLevel,1983);
    },

    getLight: function (callback) {
        if (!this.statusCache.shouldQuery()) {
            const value = this.homebridgeService.getCharacteristic(Characteristic[karakter]).value;
            if (this.debug)
                this.log(`Light returning cached value ${value}${this.statusCache.isInfinite()? " (infinite cache)": ""}`);

            callback(null, value);
            return;
        }

        http.httpRequest(this.getUrl, (error, response, body) => {
         

            if (error) {
                this.log("Light failed: %s", error.message);
                callback(error);
            }
            else if (!http.isHttpSuccessCode(response.statusCode)) {
                this.log("Light returned http error: %s", response.statusCode);
                callback(new Error("Got http error code " + response.statusCode));
            }
            else {
                let Lightlevel;
                try {
                    Lightlevel = utils.extractValueFromPattern(this.statusPattern, body, this.patternGroupToExtract);
                   
                } catch (error) {
                    this.log("Light error occurred while extracting Light from body: " + error.message);
                    callback(new Error("pattern error"));
                    return;
                }

                if (this.debug)
                    this.log("Light is currently at %s", Lightlevel);
                
                
            //initial value change if there is a function defined    
                
                 this.ilkvalue =  parseFloat(Lightlevel);      
        if (this.formula != "yok")
            {
           

                this.ilkformula = this.formula.replace("$$$", this.ilkvalue);
                this.log("ilk formula is "+ this.ilkformula);   
                this.ilkformulvalue = eval(this.ilkformula);
                this.log("ilk formulated result is "+ this.ilkformulvalue);
                Lightlevel = this.ilkformulvalue;
                
            }
     
        
                 //initial value change if there is a function defined   
                
                //carbon sensor threshold conf 
                
                 if (this.servis == "CarbonDioxideSensor"){
            
            
             const CarbonDioxideDetected = utils.getCharacteristic(this.homebridgeService, "CarbonDioxideDetected");
           
                    
                     if ((parseFloat(Lightlevel) > parseFloat(this.CarbonLimit)) && (this.CarbonLimit >0))
                {
                    CarbonDioxideDetected.updateValue(1);
                }
            else {
                CarbonDioxideDetected.updateValue(0);
            }
            
        }
                
                
                 if (this.servis == "CarbonMonoxideSensor"){
            
            
             const CarbonMonoxideDetected = utils.getCharacteristic(this.homebridgeService, "CarbonMonoxideDetected");
           
                    
                     if ((parseFloat(Lightlevel) > parseFloat(this.CarbonLimit)) && (this.CarbonLimit >0))
                {
                    CarbonMonoxideDetected.updateValue(1);
                }
            else {
                CarbonMonoxideDetected.updateValue(0);
            }
            
        }

                   //carbon sensor threshold conf 
                
                this.statusCache.queried();
                callback(null, parseFloat(Lightlevel));
            }
        });
    },

};
