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
            this.address = location.href.split("/")[2]; //this also fetches the port
            //ie if the url is http://lol.ip.com:88/
            //this should return 'lol.ip.com:88'
            //makes it so if you're using it remotely the queries are formatted correctly.
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
            $.each(data, function (_i, f) {
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
     * Changes the all leafs functions. This makes it so colors
     * effect all leafs
     * @see  setterHelper
     */
    setAllLeafs(val){
        return this.setterHelper("allLeafs", val);
    }

    /**
     * Enables / Disables autoplay.
     * Autoplay cycles through the patterns (including twinkles, I think)
     * at the timing of the autoPlayDuration
     * @see  setterHelper
     */
    setAutoplay(value){
        return this.setterHelper("autoplay", value);
    }

    /**
     * Toggle the autoplay on / off
     * @see  setterHelper
     */
    toggleAutoplay(curVal){
        if(curVal){
            this.setAutoplay(0);
        }else{
            this.setAutoplay(1);
        }
    }

    /**
     * The duration you see the current pattern in autoplay mode.
     * @see  setterHelper
     */
    setAutoplayDuration(value){
        return this.setterHelper("autoplayDuration", value);
    }

    /**
     * The brightness of the lights.
     * This accepts a value of 1-255.
     * We convert a 0-100 into the range of 1-255.
     * @see  setterHelper
     */
    setBrightness(value){
        var percent = value/100;
        var conv = percent * 255;
        return this.setterHelper("brightness", conv);
    }

    /**
     * TThe ammount of cooling that effects the fire (speed of return to white, I think.)
     * @see  setterHelper
     */
    setCooling(value){
        return this.setterHelper("cooling", value);
    }

    /**
     * The color palette to use for select few patterns (emphisis on select few)
     * @see  setterHelper
     */
    setPalette(value){
        return this.setterHelper("palette", value);
    }

    /**
     * Change the pattern index
     * @see  setterHelper
     */
    setPattern(value){
        return this.setterHelper("pattern", value);
    }

    /**
     * Turn the power to selected value
     * @see  setterHelper
     */
    setPower(value){
        return this.setterHelper("power", value);
    }

    /**
     * Toggle the power on / off
     * @see  setterHelper
     */
    togglePower(curVal){
        if(curVal){
            this.setPower(0);
        }else{
            this.setPower(1);
        }
    }

    /**
     * Set the leaf to indivdually change the color of
     * @see  setterHelper
     */
    setSelectedLeaf(value){
        return this.setterHelper("selectedLeaf", value);
    }

    /**
     * Sets the solid color for the solid color pattern, however this is useful
     * to save the last selected color too.
     * @see  setterHelper
     */
    setSolidColor(r,b,g){
        //this is a specail case, we need rgb to set a color...
        $.post(this.address + "solidColor?r=" + r + "&g=" + g + "&b=" + b, {R:r, G:g, B:b}, function(data){
            return data;
        });
    }

    /**
     * Set the amount of sparking for the fire
     * @see  setterHelper
     */
    setSparking(value){
        return this.setterHelper("sparking", value);
    }

    /**
     * Set the speed of the pattern, applies to all
     * @see  setterHelper
     */
    setSpeed(value){
        return this.setterHelper("speed", value);
    }

    /**
     * Sets the twinkle density (which appears to be how many allowed next to each other)
     * 0-8
     * @see  setterHelper
     */
    setTwinkleDensity(value){
        return this.setterHelper("twinkleDensity", value);
    }

    /**
     * Sets how fast the twinkles fade
     * 0-8
     * @see  setterHelper
     */
    setTwinkleSpeed(value){
        return this.setterHelper("twinkleSpeed", value);
    }

    //TODO: handle custom patterns, need to look at the code.
    setCustomPattern(value){
        return null;
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
        $.post(this.address + name + "?value=" + value, {name: name, value, value, function(data){
            return data;
        }});
        return null;
    }
}