/* 
    A class that allows for easy control
    of the lights.
    
    Functions for each operation should be written and clear.

    This is mostly a conversion from the "simple.js"/"app.js" file that
    was already being used. I just didn't like how it was tied 
    to elements which made it really hard to change anything
    without digging through the HTML.

    This class is hopefully more object-oriented :)

    My javascript is a little rusty, I might commit mistakes
    and probably have to change them later...
*/

class LightControl {

    //if not given an adress assume we are on
    //the esp. Otherwise use the adress given to us.
    constructor(address) {
        if (address === undefined) {
            this.address = location.hostname;
        } else {
            this.address = address;
        }
        this.address = "http://" + this.address + "/";
    }

    //this fucntion allows for fethcing information
    //from the esp.
    //when done, it sends a callback of a json query with all relevant information
    //passed as the variable
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
}