import { makeButton, is_me, characters } from "../utils/utils"
import { start_attacking, State, resupply_potions, state_controller } from "./character";
let map;
let state = State.BOSS_MODE;
let monsterTargets = ['armadillo'];

load_code('utils')
setInterval(() => {
  map = get_map()
  state = state_controller(state);
	switch (state) {
		case State.ATTACK_MODE:
			start_attacking(state, monsterTargets)
			break;
    case State.BOSS_MODE:
      start_attacking(state, monsterTargets)
      if(character.ctype === "priest"){				
        let war = get_player("notlusW")
        if(war.max_hp - war.hp > 100){
          heal(war);
        }
      }
      break;
		case State.GIVE_GOLD:
			send_gold("notlusMc", character.gold * .90);
			state = State.ATTACK_MODE;
			send_cm("notlusMc", { message: "home" });
			break;
		case State.RESUPPLY_POTIONS:
      set_message("buying pots");
			resupply_potions();
			break;
	}
}, 1000 / 4);

makeButton("switch state", () => {
	if(state === State.ATTACK_MODE){
    state = State.BOSS_MODE;
  }else{
    state = State.ATTACK_MODE;
  };
});

// credit: https://github.com/Spadar/AdventureLand
setInterval(function () {
	loot();
	
	//Heal With Potions if we're below 75% hp.
	if (character.max_hp - character.hp > 200 || character.max_mp - character.mp > 300 || character.mp == 0) {
		use_hp_or_mp();
	}
}, 500 );

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
				map: get_map()["name"]
			});
		}
	}
};


map_key("1", "snippet", "parent.stop_runner();");
map_key("2", "snippet", "parent.start_runner();");
map_key("3", "snippet", 'load_code("warrior")');
