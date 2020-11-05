const min_potions = 50; //The number of potions at which to do a resupply run.
const purchase_amount = 1000;//How many potions to buy at once.
const potion_types = ["hpot0", "mpot0"];//The types of potions to keep supplied.
const goldStoreTreshold = 3000000;

export enum State {
  ATTACK_MODE,
  BOSS_MODE,
	IDLE,
	GIVE_GOLD,
  RESUPPLY_POTIONS,
  STORE_LOOT,
}

export function start_attacking(state: State, monsterTargets: Array<string>) {
	if (state !== State.ATTACK_MODE && state !== State.BOSS_MODE || character.rip || is_moving(character) || !monsterTargets.length) { return };
  let target;
  
  if(character.ctype === "priest"){				
    let war = get_player("notlusW")
    if(war !== undefined){
      if(war.hp / war.max_hp < 0.90){
        heal(war);
      }
    }
  }
	
	target = get_targeted_monster();
	if (!target) {
		if ((state === State.BOSS_MODE && character.ctype === "warrior") || (state === State.ATTACK_MODE && character.hp/character.max_hp > 0.75)) {
      target = find_viable_targets(monsterTargets)[0];
			// target = get_nearest_monster({ min_xp: 100, max_att: 120 });
		}
		else {
      const player = get_player("notlusW");
			if(player) target = get_target_of(player)
		}
		if (target) {
			change_target(target);
		} else {
      if(!smart.moving){
        set_message("Moving to a target");
        smart_move({ to: monsterTargets[0] });
        return null;
      }
		}
	}
	
	if (target && !is_in_range(target)) {
		move(
			character.x + (target.x - character.x) / 2,
			character.y + (target.y - character.y) / 2
			);
			// Walk half the distance
		} else if (target && can_attack(target)) {
      const playerTarget = get_target_of(target);
      if(state === State.BOSS_MODE && character.ctype !== "warrior" && playerTarget && playerTarget.id !== "notlusW"){
        set_message("Waiting for warrior");
        return null;
      } 
      set_message("Attacking");
			attack(target);
		}
}

// credit: https://github.com/Spadar/AdventureLand
export function resupply_potions(){
  if(!smart.moving) smart_move({ to:"potions"});
  if(character.x == 56 && character.y == -122){
    buy_potions();
  } 
}

// credit: https://github.com/Spadar/AdventureLand
export function state_controller(currentState: State){
	//Default to farming
	var new_state = currentState;
	//Do we need potions?
	for(var type_id of potion_types){
		var num_potions = num_items(type_id);
		if(num_potions < min_potions){
			new_state = State.RESUPPLY_POTIONS;
			break;
		}
  }
  
  if((character.s.mluck && (character.s.mluck.ms < 120000 || character.s.mluck.f != "notlusMc"))|| !character.s.mluck){
    send_cm("notlusMc", {
      message: "mluck",
      name: character.name,
    });
  }

  if(character.gold > goldStoreTreshold || character.esize < 5){
    send_cm("notlusMc", {
      message: "loot",
      name: character.name,
    });
    new_state = State.STORE_LOOT;
  }
	
	return new_state;
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
// credit: https://github.com/Spadar/AdventureLand
function buy_potions(){
	if(empty_slots() > 0){
		for(var type_id of potion_types){
      var num_potions = num_items(type_id);
      if(num_potions < min_potions){
        buy(type_id, purchase_amount);
      }
		}
	}
	else{
		game_log("Inventory Full!");
	}
}

//Returns the number of items in your inventory for a given item name;
// credit: https://github.com/Spadar/AdventureLand
function num_items(name: string)
{
	var item_count = character.items.filter(item => item != null && item.name == name).reduce(function(a,b){ return a + (b["q"] || 1);
	}, 0);
	
	return item_count;
}

//Returns how many inventory slots have not yet been filled.
// credit: https://github.com/Spadar/AdventureLand
function empty_slots()
{
	return character.esize;
}

//Returns an ordered array of all relevant targets as determined by the following:
////1. The monsters' type is contained in the 'monsterTargets' array.
////2. The monster is attacking you or a party member.
////3. The monster is not targeting someone outside your party.
//The order of the list is as follows:
////Monsters are ordered by distance.
// credit: https://github.com/Spadar/AdventureLand
function find_viable_targets(monsterTargets : any) {
  var monsters = Object.values(parent.entities).filter(
      mob => (mob.target == null
                  || parent.party_list.includes(mob.target)
                  || mob.target == character.name)
              && (mob.type == "monster"
                  && (parent.party_list.includes(mob.target)
                      || mob.target == character.name))
                  || monsterTargets.includes(mob.mtype));

  //Order monsters by whether they're attacking us, then by distance.
  monsters.sort(function (current, next) {
      var dist_current = distance(character, current);
      var dist_next = distance(character, next);
      // Else go to the 2nd item
      if (dist_current < dist_next) {
          return -1;
      }
      else if (dist_current > dist_next) {
          return 1
      }
      else {
          return 0;
      }
  });
  return monsters;
}
