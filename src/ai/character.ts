const min_potions = 50; //The number of potions at which to do a resupply run.
const purchase_amount = 1000;//How many potions to buy at once.
const goldStoreTreshold = 1000000;
let potion_types = ["hpot0", "mpot0"];//The types of potions to keep supplied.
let angle = 0;
let useSkill = false;
let kane: any;
if(character.ctype == "ranger" && useSkill == true) potion_types[1] = "mpot1";

export enum State {
  ATTACK_MODE,
  BOSS_MODE,
  KITING_MODE,
  CHRISTMAS_MODE,
	IDLE,
  RESUPPLY_POTIONS,
  STORE_LOOT,
  GET_HOLIDAY_SPIRITS,
}

export function set_kane(loc: any){
  kane = loc;
}

export function start_attacking(state: State, monsterTargets: Array<string>) {
	if (state === State.IDLE || state === State.RESUPPLY_POTIONS || state === State.STORE_LOOT || character.rip || (is_moving(character) && state !== State.KITING_MODE) || !monsterTargets.length) { return };
  let target;
  
  if(character.ctype === "priest"){				
    let war = get_player("notlusW")
    if(war){
      if(war.hp / war.max_hp < 0.90){
        heal(war);
      }
    }
  }
	
	target = get_targeted_monster();
	if (!target) {
    if(state === State.CHRISTMAS_MODE){
      // if (parent.S.hasOwnProperty('grinch') && parent.S['grinch'].live) {
      //   if (kane) {
      //     smart_move(kane);
      //   } else {
      //     smart_move(parent.S['grinch']);
      //   }
      // }else 
      if(parent.S.hasOwnProperty('snowman') && parent.S['snowman'].live){
        smart_move(parent.S['snowman']);
      }
    }
		if ((state === State.BOSS_MODE && character.ctype === "warrior") || (state === State.ATTACK_MODE && character.hp/character.max_hp > 0.75) || state === State.KITING_MODE || state === State.CHRISTMAS_MODE) {
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
        smart_move({ to: monsterTargets[0] });
        return null;
      }
		}
  }
  if(target && state == State.KITING_MODE){
    const x= target.x;
    const y= target.y;

    let range = character.range - 5;

    angle += 5 % 360;

    const coord = getKiteCoord(x, y, angle, range);
    
    move(coord[0], coord[1]);
    
    if(can_attack(target)){
      set_message("Attacking");
      attack(target);
    }
  }
	
	if (target && !is_in_range(target)) {
    // Walk half the distance
    move(
      character.x + (target.x - character.x) / 2,
      character.y + (target.y - character.y) / 2
    );
  }else {
    if(useSkill == true && character.ctype == "ranger" && character.mp >= 300){
      if(target && can_attack(target)){
        set_message("3shot");
        use_skill("3shot", target);
      }
    }else{
      if (target && can_attack(target)) {
        const playerTarget = get_target_of(target);
        if(state === State.BOSS_MODE && character.ctype !== "warrior" && playerTarget && playerTarget.id !== "notlusW"){
          set_message("Waiting for warrior");
          return null;
        }
        set_message("Attacking");
        attack(target);
      }
    }
  }
}

export function get_holiday_spirits(){
  if(!smart.moving) smart_move({ to:"town"});
	parent.socket.emit("interaction",{type:"newyear_tree"});
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
  
  if((character.s.mluck && (character.s.mluck.ms < 120000 || character.s.mluck.f != "notlusMc")) || !character.s.mluck){
    send_cm("notlusMc", {
      message: "mluck",
      name: character.name,
    });
  }

  if(character.gold > goldStoreTreshold || character.esize < 20){
    send_cm("notlusMc", {
      message: "loot",
      name: character.name,
    });
    new_state = State.STORE_LOOT;
  }

  // if(!character.s.holidayspirit){
  //   new_state = State.GET_HOLIDAY_SPIRITS;
  // }
	
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

function getKiteCoord(xCoord: number, yCoord: number, angle: number, length: number) {
  length = typeof length !== 'undefined' ? length : 10;
  angle = angle * Math.PI / 180; // if you're using degrees instead of radians
  return [length * Math.cos(angle) + xCoord, length * Math.sin(angle) + yCoord]
}
