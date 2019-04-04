/* 
    A class that allows for easy control
    of the lights.
    
    Functions for each operation should be written and clear.

    This is mostly a conversion from the "simple.js"/"app.js" file that
    was already being used. I just didn't like how it was tied 
    to elements which made it really hard to change anything
    without digging through the HTML.

        A note on that, they both create a websocket server, however the
        websocket never connects. Upon further inspection of why this is,
        I discovered that the websocket is never enabled.
        Iniside "esp8266-nanoleaf-webserver.ino" lines 486-488
            This includes all calls to it. Strange.

    This class is hopefully more object-oriented :)

    My javascript is a little rusty, I might commit mistakes
    and probably have to change them later...
*/

class LightControl {

    /**
     * Constructor for the class. Will simlpy setup the adress variable.
     * @param {string} address Adress to talk the ardruino, if blank will use location.hostname.
     */
    constructor(address) {
        if (address === undefined) {
            this.address = location.hostname;
        } else {
            this.address = address;
        }
        this.address = "http://" + this.address + "/";
    }

    /**
     * Function that uses the "rest" apis on the ESP to find all of the current settings.
     * Some parsing must be done as they are originally in a format to allow for HTML
     * generation, but that makes it a pain to re-use for other things.
     * @param {Function} callback optional: allows for handing of the json by a different function
     * 
     * @return {JSON} A nested JSON array that contains all relevant settings.
     */
    fetchInformation(callback) {
        $.get(this.address + "all", function (data) {
            var temp = new Array();
            $.each(data, function (i, f) {
                //are we looking at an actual value or a section...
                //because apparently /all doesn't return html
                //but actually returns an array of HTML specifications
                if (f.value != undefined) {
                    //info we care about
                    var name = f.name, val = f.value, options = f.options, min=f.min, max = f.max;
                    
                    //plunk it into an array
                    var itemProps = new Array();
                    itemProps['value'] = val;

                    //some that might not always be there...
                    if(options !== undefined)
                        itemProps['options'] = options;
                    if(min !== undefined)
                        itemProps['min'] = min;
                    if(max !== undefined)
                        itemProps['max'] = max;

                    //setup the name (makes it easy to find later)
                    temp[name] = itemProps;
                }
            });
            //setup the full
            this.jsonINFO = temp;

            //make sure theres a function to callback...
            if(callback && {}.toString.call(callback) === '[object Function]'){
                callback(this.jsonINFO);
            }
        });
    }

    /**
     * A simple function to cut down on the amount of $.get() functions.
     * Formats the string in the expected way provied a name and a value.
     * @param {string} name The name of the property to be set
     * @param {int} value The value to be set
     * 
     * @return {string} The response string from the server. 
     */
    setterHelper(name, value){
        $.post(address + name + "?value=" + value, {name: name, value, value, function(data){
            return data;
        }});
    }

    /**
     * Changes the all leafs functions. This makes it so colors
     * effect all leafs
     * @see  setterHelper
     */
    setAllLeafs(val){
        setterHelper("allLeafs", val);
    }

    /**
     * Enables / Disables autoplay.
     * Autoplay cycles through the patterns (including twinkles, I think)
     * at the timing of the autoPlayDuration
     * @see  setterHelper
     */
    setAutoplay(value){
        setterHelper("autoplay", value);
    }

    /**
     * The duration you see the current pattern in autoplay mode.
     * @see  setterHelper
     */
    setAutoplayDuration(value){
        setterHelper("autoplayDuration", value);
    }

    /**
     * The brightness of the lights.
     * This accepts a value of 1-255.
     * We convert a 0-100 into the range of 1-255.
     * @see  setterHelper
     */
    setBrightness(value){
        //TODO: convert 100 range into 255 range.
        setterHelper("brightness", value);
    }

    setCooling(value){
        setterHelper("cooling", value);
    }

    setPalette(value){
        setterHelper("palette", value);
    }

    setPattern(value){
        setterHelper("pattern", value);
    }

    setPower(value){
        setterHelper("power", value);
    }

    setSelectedLeaf(value){
        setterHelper("selectedLeaf", value);
    }

    setSolidColor(r,b,g){
        //this is a specail case, we need rgb to set a color...
        $.post(address + name + "?r=" + r + "&g=" + g + "&b=" + b, {name: name, value, value, function(data){
            return data;
        }});
    }

    setSparking(value){
        setterHelper("sparking", value);
    }

    setSpeed(value){
        setterHelper("speed", value);
    }

    setTwinkleDensity(value){
        setterHelper("twinkleDensity", value);
    }

    setTwinkleSpeed(value){
        setterHelper("twinkleSpeed", value);
    }

    //TODO: handle custom patterns, need to look at the code.


}