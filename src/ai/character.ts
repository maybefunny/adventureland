var min_potions = 50; //The number of potions at which to do a resupply run.
var purchase_amount = 1000;//How many potions to buy at once.
var potion_types = ["hpot0", "mpot0"];//The types of potions to keep supplied.

export enum State {
	ATTACK_MODE,
	IDLE,
	GIVE_GOLD,
	RESUPPLY_POTIONS,
}
export function start_attacking(state: State, monsterTargets: any) {
	if (state !== State.ATTACK_MODE || character.rip || is_moving(character)) { return };
	let target;
	
	target = get_targeted_monster();
	if (!target) {
		if (character.ctype === "warrior") {
      target = find_viable_targets(monsterTargets)[0];
			// target = get_nearest_monster({ min_xp: 100, max_att: 120 });
		}
		else {
			target = get_target_of(get_player("notlusW"))
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

//Returns an ordered array of all relevant targets as determined by the following:
////1. The monsters' type is contained in the 'monsterTargets' array.
////2. The monster is attacking you or a party member.
////3. The monster is not targeting someone outside your party.
//The order of the list is as follows:
////Monsters are ordered by distance.
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
