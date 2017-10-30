//-------------------------------------------------------------------------
// Customization
//  - You can personalize your character by setting the following values
//-------------------------------------------------------------------------
var shortname   = "ccb";
//-------------------------------------------------------------------------
// idkwtf
//-------------------------------------------------------------------------
/* Uncomment this when you have set your class name*/
function idkwtf(name){
    Player.call(this, name);
}

idkwtf.Inherits(Player);

idkwtf.prototype.__act = function() {
    Player.prototype.__act.call(this);
    var myRoom = this.getLocation();
    //var haveKeycard = false;
    var doImove = true;
    
    // check possessions
    var myItems = this.getPossessions();
    var myWeapon = undefined;
    
    // find weapon
    var weaponList = filter(function(x) 
                {return is_instance_of(x, Weapon);}, myItems);
    // equip weapon
    if (!is_empty_list(weaponList)) {
        myWeapon = head(weaponList);
        //display("my weapon =" + myWeapon.getName());
        //display("weapon charging = " + myWeapon.isCharging());
    } else {}
    
    // actions on occupants of room
    var occupants = myRoom.getOccupants();
    //display(occupants);
    
    // find serviceBots
    var enemyList = filter(function(x) {
                return is_instance_of(x, ServiceBot);}, occupants);
    // attack enemies
    if (!is_empty_list(enemyList)) {
        if (!myWeapon.isCharging()) {
            doImove = false; //stay and fight
            display("enemy is " + head(enemyList).getName());
            var targets = enemyList;
            this.use(myWeapon, targets);
        } else {}
    } else {}
    
    
    // find shit in room
    var stuff = myRoom.getThings();
    // pick up keycards
    var keycardList = filter(function(x) {
                return is_instance_of(x, Keycard);}, stuff);
    if (!is_empty_list(keycardList)) {
        this.take(keycardList);
        this.say("TAKEN CARD");
        //haveKeycard = true;
        display(myItems);
    } else {}
    
    // find adjacent rooms
    var nearbyRooms = myRoom.getNeighbours();
    var directions = myRoom.getExits();
    
    
    // moving habits
    var protectedRm = filter(function(x) {
                return is_instance_of(x, ProtectedRoom);}, nearbyRooms);
    // find keycard
    var myKeycards = filter(function(x) 
                {return is_instance_of(x, Keycard);}, myItems);
    // enter protected room
    if (!is_empty_list(protectedRm)) {
        if (!is_empty_list(myKeycards)) {
            alert("ROOM here");
            this.moveTo(head(protectedRm));
        } else {
            // stay for bots
            alert("NO CARD");
        }
        
    } else if (doImove) {
        display(directions);
        var nextMove = list_ref(directions, getRandomIntInclusive(0, length(directions)));
        this.go(nextMove);
    } else {}
};

var newPlayer = new idkwtf(shortname);
test_task2(newPlayer);

function getRandomIntInclusive(min, max) {
    min = math_ceil(min);
    max = math_floor(max);
    return math_floor(math_random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}