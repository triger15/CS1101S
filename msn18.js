//-------------------------------------------------------------------------
// Customization
//  - You can personalize your character by setting the following values
//-------------------------------------------------------------------------
var shortname   = "zzz";
//-------------------------------------------------------------------------
// idkwtf
//-------------------------------------------------------------------------
/* Uncomment this when you have set your class name*/
function getRandomInt(min, max) {
    return math_floor(math_random() * (math_floor(max) - math_ceil(min)) ); //The maximum is exclusive and the minimum is inclusive
}

function idkwtf(name){
    Player.call(this, name);
}

idkwtf.Inherits(Player);

/* M17 T1 */
// List of rooms entered
var roomsEntered = {};
// M17 T2
//remember generator room
var generatorRoom = undefined;
var path = [];

//BFS algo to find room
function find_room(current_room) {
    var bfs_rooms = {};
    var bfs_parents = {};
    
    // return list of path of rooms based on their parents
    function get_path(parent_node) {
        if (parent_node === current_room) {
            //return path
        } else {
            var parent = bfs_parents[parent_node.getName()];
            path.push(parent);
            return get_path(parent);
        }
    }
    
    var que = [];
    que.push(current_room);
    while (array_length(que) > 0) {
        // dequeue node, record its name in bfs rooms object, add to paths traversed
        var node = que.shift();
        bfs_rooms[node.getName()] = node;
        
        var adjacent_rms = node.getNeighbours();
        var possible_gen_rms = filter(function(x) {
                    return is_instance_of(x, ProtectedRoom);}, adjacent_rms);
        // found gen room
        if (!is_empty_list(possible_gen_rms)) {
            generatorRoom = head(possible_gen_rms);
            // empty que
            que = [];
            display("gen rm: " + generatorRoom.getName());
            path = [node];
            get_path(node);
        } else {
            // add adjacent rooms to que if they have not been visited before, add their parents
            for_each(function(x) {
                if (bfs_rooms[x.getName()] === undefined) {
                   bfs_parents[x.getName()] = node;
                   que.push(x);} else {} 
            }, adjacent_rms); 
                
        }
    }
}

idkwtf.prototype.__act = function() {
    Player.prototype.__act.call(this);
    var myRoom = this.getLocation();
    
    /* M17 T1  remember rooms */
    var myRoomName = myRoom.getName();
    if (roomsEntered[myRoomName] === undefined) {
        roomsEntered[myRoomName] = myRoom;
    } else {
    }
    // M17 end code
    
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
    display("others here :" + occupants);
    
    // find serviceBots & securityDrones MODIFIED M17 T1
    var enemyList = filter(function(x) {
                return (is_instance_of(x, ServiceBot) 
                        || is_instance_of(x, SecurityDrone));}, occupants);
    // attack enemies
    if (!is_empty_list(enemyList)) {
        display("enemy is " + head(enemyList).getName());
        if (!myWeapon.isCharging()) {
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
        // MOVE
        find_room(myRoom);
    } else {}
    
    // find adjacent rooms
    var nearbyRooms = myRoom.getNeighbours();
    var directions = myRoom.getExits();
    
    // detect protector rooms
    var protectedRm = filter(function(x) {
                return is_instance_of(x, ProtectedRoom);}, nearbyRooms);
    // find keycard
    var myKeycards = filter(function(x) 
                {return is_instance_of(x, Keycard);}, myItems);
    
    // M17 T1: check for unvisited rooms
    var unvisited_rooms = filter
                (function(x) {return roomsEntered[x.getName()] === undefined; }, nearbyRooms);
    
    // enter protected room
    if (!is_empty_list(protectedRm)) {
        if (!is_empty_list(myKeycards)) {
            display("ROOM here");
            this.moveTo(head(protectedRm));
        } else {
            // M17 T2 rmb room
            generatorRoom = head(protectedRm);
            display("NO CARD");
            this.moveTo(list_ref(nearbyRooms, getRandomInt(0, length(nearbyRooms))));
        }
        
    // M17 T2: got keycard chiong to room
    } else if (!is_empty_list(myKeycards)) {
        // recalculate if moved (respawn)
        var next_move = path.pop();
        this.moveTo(next_move);

    // M17 T1: found unvisited room, move to random unvisited room
    } else if (!is_empty_list(unvisited_rooms)) {
        this.moveTo(list_ref(unvisited_rooms, getRandomInt(0, length(unvisited_rooms))));
    // no unvisited room
    } else {
        this.moveTo(list_ref(nearbyRooms, getRandomInt(0, length(nearbyRooms))));
    }
};

// Uncomment the following to test
var newPlayer = new idkwtf(shortname);
test_task1(newPlayer);