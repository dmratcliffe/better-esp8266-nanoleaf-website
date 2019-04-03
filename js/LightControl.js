/* 
    A class that allows for easy control
    of the lights.
    
    Functions for each operation should be written and clear.

    This is mostly a conversion from the "simple.js" file that
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
    constructor(address){
        if(address == undefined){
            this.address = location.hostname;
        }else{
            this.address = address;
        }
    }

}