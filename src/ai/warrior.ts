import { makeButton, is_me, characters } from "../utils/utils"
import { start_attacking, State, resupply_potions, get_holiday_spirits, state_controller, set_kane } from "./character";

performance_trick();
pause();

let baseState = State.ATTACK_MODE;
let storingLoot = false;
let monsterTargets = new Array();
const goldMinimumTreshold = 100000;
const defaultServerRegion = "US";
const defaultServerName = "I";
let currentServerRegion = server.region;
let currentServerName = server.id;

switch (character.name){
  case "notlusW":
    baseState = State.CHRISTMAS_MODE;
    monsterTargets = ["grinch", "snowman", "arcticbee"];
    break;
  case "notlusssRa":
    baseState = State.CHRISTMAS_MODE;
    monsterTargets = ["grinch", "snowman", "arcticbee"];
    break;
  case "notlusRa2":
    monsterTargets = ["bee"];
    break;
  case "notlus":
    baseState = State.CHRISTMAS_MODE;
    monsterTargets = ["grinch", "snowman", "arcticbee"];
    break;
  case "notlussPr":
    baseState = State.CHRISTMAS_MODE;
    monsterTargets = ["grinch", "snowman", "arcticbee"];
    break;
  case "notlusRg":
    baseState = State.KITING_MODE;
    monsterTargets = ["grinch", "snowman", "arcticbee"];
    break;
}

load_code('utils')
setInterval(() => {
  if(baseState == State.CHRISTMAS_MODE){
    // if(parent.S.hasOwnProperty('grinch') && parent.S['grinch'].live){
    //   monsterTargets = ["grinch"];
    // }else 
    if(parent.S.hasOwnProperty('snowman') && parent.S['snowman'].live){
      monsterTargets = ["snowman"];
    }else if(!server.pvp) {
      monsterTargets = ["arcticbee"];
    }
  }
  let state = state_controller(baseState);
	switch (state) {
		case State.ATTACK_MODE:
      set_message("farm");
			start_attacking(state, monsterTargets)
			break;
    case State.BOSS_MODE:
      set_message("boss");
      start_attacking(state, monsterTargets)
      break;
    case State.CHRISTMAS_MODE:
      set_message("christmas");
      start_attacking(state, monsterTargets)
      break;
    case State.KITING_MODE:
      set_message("kiting");
      start_attacking(state, monsterTargets)
      break;
		case State.RESUPPLY_POTIONS:
      set_message("waiting for pots");
			resupply_potions();
			break;
    case State.STORE_LOOT:
      set_message("loot");
      storingLoot = true;
      break;
    case State.GET_HOLIDAY_SPIRITS:
      set_message("spirit");
      get_holiday_spirits();
      break;
    case State.IDLE:
      set_message("idle");
      if(can_use("regen_hp")){
        use_skill("regen_hp");
      }
      if(can_use("regen_mp")){
        use_skill("regen_mp");
      }
      break;
	}
}, 1000 / 4);

makeButton("switch", () => {
	if(baseState === State.ATTACK_MODE){
    baseState = State.BOSS_MODE;
    game_log('switched to: boss');
  }else{
    baseState = State.ATTACK_MODE;
    game_log('switched to: farm');
  };
});

makeButton("addTarget", () => {
  const target = prompt("Please enter your name", "goo");
  monsterTargets.push(target);
  show_json(monsterTargets);
});

// credit: https://github.com/Spadar/AdventureLand
// pots usage logic
setInterval(function () {
	loot();
  
	//Heal With Potions if we're below 75% hp.
	if (character.max_hp - character.hp > 200 || character.max_mp - character.mp > 300 || character.mp == 0) {
		use_hp_or_mp();
  }
  
  if(character.rip){
    respawn();
  }
}, 500 );

// loot storing handler
setInterval(() => {
  if(!storingLoot) return;
  const merch = get_player('notlusMc');
  let skippedItems = 0;
  if(merch && is_in_range(merch, 'mluck')){
    for (var i = 1; i < 42; i++) {
      const item = character.items[i];
      if(!item || parent.G.items[item.name].type === "pot"){
        skippedItems++;
        continue;
      }
      item.q?send_item(merch.name, i, item.q):send_item(merch.name, i, 1);
    }
    if(character.gold > goldMinimumTreshold) send_gold("notlusMc", character.gold - goldMinimumTreshold);
  }
  if(character.esize >20 && character.gold < 1000000){
    storingLoot = false;
    send_cm("notlusMc", {
      message: "loot:done",
      name: character.name,
    });
  }
}, 1000/4);

// handle server switching
setInterval(() => {
  if(baseState === State.CHRISTMAS_MODE){
    GetServerStatuses(s => { 
      let liveEvents = s.filter(e => true == e.live)
      let priority = liveEvents[0];
    
      // for(let event of liveEvents)
      // {
      //   if(event.eventname === "grinch" && (priority.eventname !== "grinch" || event.hp < priority.hp)){
      //     priority = event;
      //   }
      // }
      // if(priority && priority.eventname == "grinch"){
      //   if(priority.server_identifier != "PVP" && (currentServerRegion  != priority.server_region || currentServerName != priority.server_identifier)){
      //     currentServerRegion = priority.server_region;
      //     currentServerName = priority.server_identifier;
      //     change_server(priority.server_region, priority.server_identifier);
      //   }
      //   return;
      // }else{
      //   game_log("no grinch")
      
        for(let event of liveEvents)
        {
          if(event.eventname === "snowman" && (priority.eventname !== "snowman" || event.hp < priority.hp)){
            priority = event;
          }
        }
        if(priority && priority.eventname === "snowman"){
          if(priority.server_identifier != "PVP" && (currentServerRegion  != priority.server_region || currentServerName != priority.server_identifier)){
            currentServerRegion = priority.server_region;
            currentServerName = priority.server_identifier;
            change_server(priority.server_region, priority.server_identifier);
          }
          return;
        }else{
          game_log("no snowman")
          if(server.pvp && currentServerRegion  != defaultServerRegion || currentServerName != defaultServerName){
              currentServerRegion = defaultServerRegion;
              currentServerName = defaultServerName;
            change_server(defaultServerRegion, defaultServerName);
          }
          return;
        }
      // }
    });
  }else{
    if(currentServerRegion  != defaultServerRegion || currentServerName != defaultServerName){
        currentServerRegion = defaultServerRegion;
        currentServerName = defaultServerName;
      change_server(defaultServerRegion, defaultServerName);
    }
  }
}, 1000*10);

// get kane position
// setInterval(() => {
//   if(baseState == State.CHRISTMAS_MODE){
//     if(parent.S.hasOwnProperty('grinch') && parent.S['grinch'].live){
//       game_log('locating kane');
//       send_cm('Escp','kane');
//       send_cm("RisingKyron", "kane");
//       send_cm("Foaly", "kane");
//     }
//   }
// }, 1000 * 3);

on_cm = (from: string, data: any) => {    
	if (is_me(from)) {
		if (data.message === "data") {            
			send_cm("notlusMc", {
				message: "data", 
				name: character.name,
				gold: character.gold,
				hp: character.hp,
				max_hp: character.max_hp,
				xp: character.xp,
				max_xp: character.max_xp,
				x: character.x,
				y: character.y,
        map: character.map,
        server_region: server.region,
        server_id: server.id
			});
		}
  }else{
    // console.log(data);
    set_kane(data);
  }
};

function GetServerStatuses(callback: any)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", "https://www.aldata.info/api/ServerStatus", true); // true for asynchronous 
    xmlHttp.send(null);
}

map_key("1", "snippet", "parent.stop_runner();");
map_key("2", "snippet", "parent.start_runner();");
map_key("3", "snippet", 'load_code("warrior")');
