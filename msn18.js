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

// M18 T1: find enemies
//var dir_list = ["north", "south", "east", "west"];
// ADD type of weapon
function find_enemies(current_room, range, directions) {
    //var distance = 0;
    var enemy_list = [];
    display("Ddwd  " + is_empty_list(enemy_list));
    
    function direction_helper(room, dir, distance) {
        if (distance === range) {
            display("max range " + room.getName());
            //return;
        } else {
            var roomEnemies = filter(function(x) {return (is_instance_of(x, ServiceBot) 
                        || is_instance_of(x, SecurityDrone));}, room.getOccupants());
            if (!is_empty_list(roomEnemies)) {
                // found enemy    
                display("enemy " + roomEnemies + is_list(roomEnemies));
                enemy_list = append(enemy_list, roomEnemies);
            } else {}
            
            var nextrm = room.getExit(dir);
            if (is_object(nextrm)) {
                return direction_helper(room.getExit(dir), dir, distance + 1);
            } else {display("nothing beyond " + room.getName());}
            
        }
    }
    
    function unary_f(dir) {
        return direction_helper(current_room, dir, 0);
    }
    // check each direction according to specified range
    for_each(unary_f, directions);
    display("en1");
    display(enemy_list);
    display("en ");
    //return enemy_list;
}

idkwtf.prototype.__act = function() {
    Player.prototype.__act.call(this);
    var myRoom = this.getLocation();
    
    // t
    
    var possible_dir = filter(function(x) {return ((x !== "up") && (x !== "down"));}, myRoom.getExits());
    display(possible_dir);
    find_enemies(myRoom, 3, possible_dir);
    
    
    /* M17 T1  remember rooms */
    var myRoomName = myRoom.getName();
    if (roomsEntered[myRoomName] === undefined) {
        roomsEntered[myRoomName] = myRoom;
    } else {
    }
    // M17 end code
    
    // check possessions
    var myItems = this.getPossessions();
    //var myWeapon = undefined;
    
    // M18 T1: equip weapons
    var lightsaber = head(filter(function(x) 
                {return is_instance_of(x, MeleeWeapon);}, myItems));
    var rifle = head(filter(function(x) 
                {return is_instance_of(x, RangedWeapon);}, myItems));
    var rifle_range = rifle.getRange();
    var lightning = head(filter(function(x) 
                {return is_instance_of(x, SpellWeapon);}, myItems));
    var lightning_range = lightning.getRange();
    display(lightning_range + ":lightning ||  rifle:" + rifle_range);
    
    // actions on occupants of room
    var occupants = myRoom.getOccupants();
    display("others here :" + occupants);
    
    // find serviceBots & securityDrones MODIFIED M17 T1 in my room
    var enemyList = filter(function(x) {
                return (is_instance_of(x, ServiceBot) 
                        || is_instance_of(x, SecurityDrone));}, occupants);
    // M18 T1 : attack enemies in same room
    if (!is_empty_list(enemyList)) {
        display("enemy is " + head(enemyList).getName());
        if (!lightsaber.isCharging()) {
            var targets = enemyList;
            this.use(lightsaber, targets);
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