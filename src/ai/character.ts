var min_potions = 50; //The number of potions at which to do a resupply run.
var purchase_amount = 1000;//How many potions to buy at once.
var potion_types = ["hpot0", "mpot0"];//The types of potions to keep supplied.

export enum State {
	ATTACK_MODE,
	IDLE,
	GIVE_GOLD,
	RESUPPLY_POTIONS,
}
export function start_attacking(state: State) {
	if (state !== State.ATTACK_MODE || character.rip || is_moving(character)) { return };
	let target;
	
	target = get_targeted_monster();
	if (!target) {
		if (character.ctype === "warrior") {
			target = get_nearest_monster({ min_xp: 100, max_att: 120 });
		}
		else {
			target = get_target_of(get_player("notlusW"))
		}
		if (target) {
			change_target(target);
		} else {
			set_message("No Monsters");
			return null;
		}
	}
	
	if (!is_in_range(target)) {
		move(
			character.x + (target.x - character.x) / 2,
			character.y + (target.y - character.y) / 2
			);
			// Walk half the distance
		} else if (can_attack(target)) {
			set_message("Attacking");
			attack(target);
		}
}
	
export function resupply_potions(){
  if(!smart.moving) smart_move({ to:"potions"});
  if(character.x == 56 && character.y == -122){
    buy_potions();
  } 
}

export function state_controller(){
	//Default to farming
	var new_state = State.ATTACK_MODE;
	//Do we need potions?
	for(var type_id of potion_types){
		var num_potions = num_items(type_id);
		if(num_potions < min_potions){
			new_state = State.RESUPPLY_POTIONS;
			break;
		}
	}
	
	return new_state;
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
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
function num_items(name: string)
{
	var item_count = character.items.filter(item => item != null && item.name == name).reduce(function(a,b){ return a + (b["q"] || 1);
	}, 0);
	
	return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots()
{
	return character.esize;
}
