import { makeButton, is_me, characters } from "../utils/utils"
import { start_attacking, State, resupply_potions, state_controller } from "./character";

let baseState = State.ATTACK_MODE;
let storingLoot = false;
let monsterTargets = new Array();
const goldMinimumTreshold = 100000;

switch (character.name){
  case "notlusW":
    monsterTargets = ["minimush"];
    break;
  case "notlusssRa":
    monsterTargets = ["bee"];
    break;
  case "notlusRa2":
    monsterTargets = ["bee"];
    break;
  }

load_code('utils')
setInterval(() => {
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
		case State.RESUPPLY_POTIONS:
      set_message("waiting for pots");
			resupply_potions();
			break;
    case State.STORE_LOOT:
      set_message("loot");
      storingLoot = true;
      state = State.ATTACK_MODE;
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
}, 500 );

// loot storing handler
setInterval(() => {
  if(!storingLoot) return;
  const merch = get_player('notlusMc');
  let skippedItems = 0;
  if(merch && is_in_range(merch, 'mluck')){
    for (var i = 0; i < 42; i++) {
      const item = character.items[i];
      if(!item || parent.G.items[item.name].type === "pot"){
        skippedItems++;
        continue;
      }
      item.q?send_item(merch.name, i, item.q):send_item(merch.name, i, 1);
    }
    send_gold("notlusMc", character.gold - goldMinimumTreshold);
  }
  if(character.esize >=20 ){
    storingLoot = false;
    baseState = State.ATTACK_MODE;
    send_cm("notlusMc", {
      message: "loot:done",
      name: character.name,
    });
  }
}, 1000/4);

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
				map: character.map
			});
		}
	}
};


map_key("1", "snippet", "parent.stop_runner();");
map_key("2", "snippet", "parent.start_runner();");
map_key("3", "snippet", 'load_code("warrior")');
