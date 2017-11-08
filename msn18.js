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
// M18
var bombUsed = false;

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
// return either direction of targets or list of targets
function find_enemies(current_room, range, directions, type) {
    //var distance = 0;
    var enemy_list = [];
    var direction = undefined;
    // recursively find targets in same direction
    function direction_helper(room, dir, distance) {
        if (distance > range) {
            display("max range " + room.getName());
            //return;
        } else {
            var roomEnemies = filter(function(x) {return (is_instance_of(x, ServiceBot) 
                        || is_instance_of(x, SecurityDrone));}, room.getOccupants());
            if (!is_empty_list(roomEnemies)) {
                // found enemy    
                // append enemy list if intending to use rifle, else get direction
                if (type === "ranged") {
                    enemy_list = append(enemy_list, roomEnemies);
                } else {
                    direction = dir;
                }
            } else {}
            // get next room, checking if it exists
            var nextrm = room.getExit(dir);
            if (is_object(nextrm)) {
                return direction_helper(room.getExit(dir), dir, distance + 1);
            } else {}
            
        }
    }
    // pass to for_each
    function unary_f(dir) {
        return direction_helper(current_room, dir, 0);
    }
    // check each direction according to specified range
    for_each(unary_f, directions);
    // return target list if ranged weapon specified, else direction of targets
    if (type === "ranged") {
        return enemy_list;
    } else {
        return direction;
    }
}

idkwtf.prototype.__act = function() {
    Player.prototype.__act.call(this);
    var myRoom = this.getLocation();
    
    // M18 T1
    var possible_dir = filter(function(x) {return ((x !== "up") && (x !== "down"));}, myRoom.getExits());
    display(possible_dir);
    
    
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
    // M18 T2: equip bomb
    var bomb = head(filter(function(x) 
                {return is_instance_of(x, Bomb);}, myItems));
    
    // actions on occupants of room
    var occupants = myRoom.getOccupants();
    
    // find serviceBots & securityDrones MODIFIED M17 T1 in my room
    var enemyList = filter(function(x) {
                return (is_instance_of(x, ServiceBot) 
                        || is_instance_of(x, SecurityDrone));}, occupants);
    // M18 T1 : attack enemies in same room
    if (!is_empty_list(enemyList) && !lightsaber.isCharging()) {
        this.use(lightsaber, enemyList);
    } else {}
    
    // M18 T1: continue attacking. use ranged weapon before spell weapon
    var ranged_en = find_enemies(myRoom, rifle_range, possible_dir, "ranged");
    if (!is_empty_list(ranged_en) && !rifle.isCharging()) {
        this.use(rifle, ranged_en);
    } else {}
    
    var spell_dir = find_enemies(myRoom, lightning_range, possible_dir, "spell");
    if (spell_dir !== undefined && !lightning.isCharging()) {
        this.use(lightning, spell_dir);
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
    if (!is_empty_list(protectedRm) && !bombUsed) {
        if (!is_empty_list(myKeycards)) {
            display("ROOM here");
            this.moveTo(head(protectedRm));
            // M18 T2: plant bomb and GTFO
            if (bomb.canBeUsed()) {
                this.use(bomb);
                bombUsed = true;
            } else {}
        } else {
            // M17 T2 rmb room
            generatorRoom = head(protectedRm);
            display("NO CARD");
            this.moveTo(list_ref(nearbyRooms, getRandomInt(0, length(nearbyRooms))));
        }
        
    // M18 T2: GTFO
    } else if (bombUsed) {
        display("bomb used");
        var ok_rooms = filter(function(x) {return !is_instance_of(x, ProtectedRoom);}, nearbyRooms);
        this.moveTo(head(ok_rooms));
        
    // M17 T2: got keycard chiong to room
    } else if (!is_empty_list(myKeycards) && !bombUsed) {
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
test_task2(newPlayer);

// "generator is destroyed!"