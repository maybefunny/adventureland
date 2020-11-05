import { stat } from "fs";
import { makeButton, clearGameLog, clearChat, is_me, characters } from "utils/utils";

enum State{
	IDLE,
	MLUCK,
	POTS,
	NOTAFK,
	LOOT,
	SELL,
  UPGRADE,
  WTF,
	COMPOUND,
}

let upgrading = false;
let compounding = false;
let state = State.IDLE;
let mluckTargets: Array<string> = [];
let lootTargets: Array<string> = [];
let upgradeTargets = new Array();
let compoundTargets: {[index: string]: { [index: string]: Array<number>}} = {};
let sellTargets = new Array();
let party: any;

// Upgrade variables
const upgradeMaxLevel = 9; //Max level it will stop upgrading items at if enabled
const gold_start = 1000000; // start upgrading at this much gold
const gold_limit = 50000; // stop upgrading at this much gold

const upgradeWhitelist: {[index: string]: number} = {
	//ItemName, Max Level
	// pyjamas: upgradeMaxLevel,
	// bunnyears: upgradeMaxLevel,
	// carrotsword: upgradeMaxLevel,
	// firestaff: 7,
	// fireblade: 7,
	// staff: upgradeMaxLevel,
	// bow: upgradeMaxLevel,
	// sshield: 7,
	// shield: 7,
	// gloves: 7,
	// shoes: 7,
	// coat: 7,
	// helmet: 7,
	// pants: 7,
	// gloves1: 7,
	// coat1: 7,
	// helmet1: 7,
	// pants1: 7,
	// shoes1: 7,
	// harbringer: 5,
	// oozingterror: 5,
	// bataxe: 7,
	// spear: 7,
	// xmaspants: 7,
	// xmassweater: 7,
	// xmashat: 7,
	// xmasshoes: 7,
	// mittens: 7,
	// ornamentstaff: 7,
	// candycanesword: 7,
	// warmscarf: 7,
	// t2bow: 7,
	// pmace: 7,
	// basher: 7,
	// harmor: 5,
	// hgloves: 5,
	// wingedboots: 7,
	wshoes: 5,
	wcap: 5,
	wbreeches: 5,
	wgloves: 5,
};

const combineWhitelist: {[index: string]: number} = {
	//ItemName, Max Level
	wbook0: 3,
	lostearring: 2,
	// hpamulet: 3,
	strearring: 3,
	intearring: 3,
	dexearring: 2,
	hpbelt: 3,
	ringsj: 3,
	strring: 3,
	intring: 3,
	dexring: 2,
	vitring: 3,
	dexamulet: 2,
	intamulet: 3,
	stramulet: 3,
	vitearring: 3,
	dexbelt: 2,
	intbelt: 3,
	strbelt: 3
};

const sellWhitelist = [
	'strings',
	'hpamulet',
	'mushroomstaff'
];

game_log("script is running");

// main state handler
setInterval(() => {
	stateController();
	switch(state){
		case State.IDLE:
		set_message('idle');
		idling();
		break;
		case State.MLUCK:
		set_message('mluck');
		castMluck();
		break;
		case State.POTS:
		set_message('pots');
		break;
		case State.LOOT:
		set_message('loot');
		manageLoot();
		break;
		case State.SELL:
		set_message('sell');
		break;
		case State.UPGRADE:
		set_message('upgrade');
		break;
		case State.COMPOUND:
		set_message('compound');
		break;
		case State.NOTAFK:
		set_message('notafk');
		break;
	}
	
}, 1000/4);

// loot upgrade handler
setInterval(() => {
	if(!upgradeTargets.length && state == State.UPGRADE) state = State.IDLE;
  if(upgrading || state != State.UPGRADE || !upgradeTargets.length || is_moving(character)) return;
  
  if(character.map != "main" || character.x != -312 || character.y != -73){
    smart_move({x: -312, y: -73, map: "main"});
    return;
  }
	
	const index = upgradeTargets[0]
	const item = character.items[index];
	if(item){
    const targetLevel = upgradeWhitelist[item?.name];
		if(item.level && item.level < targetLevel){
			game_log("upgrading " + item?.name);
			const grade = item_grade(item);
			let scrollName = "";
			if(grade == 0){
				scrollName = "scroll0";
			}else if(grade == 1){
				scrollName = "scroll1";
			}else if(grade == 2){
				scrollName = "scroll2";
			}
			const scrollSlot = locate_item(scrollName);
			if(scrollSlot == -1){
				buy(scrollName).then(() => {
					upgrading = true;
					upgrade(index, scrollSlot).finally(() => {
						upgrading = false;
					});
				});
			}else{
				upgrading = true;
				upgrade(index, scrollSlot).finally(() => {
					upgrading = false;
				});
			}
		}else{
			upgradeTargets.shift();
		}
  }
}, 1000/4);

// loot combine handler
setInterval(() => {
  if(!Object.keys(compoundTargets).length && state == State.COMPOUND) state = State.IDLE;
  if(compounding || state !== State.COMPOUND || !Object.keys(compoundTargets).length || is_moving(character)) return;
  
  closeMerchStand();
  if(character.map != "main" || character.x != -312 || character.y != -73){
    smart_move({x: -312, y: -73, map: "main"});
    return;
  }

  const itemName = Object.keys(compoundTargets)[0];
  const itemGroup = compoundTargets[itemName];
  if(Object.keys(itemGroup).length !== 0){
    const itemLevel = Object.keys(itemGroup)[0];
    const itemLocList = itemGroup[itemLevel];
    const itemTotal = itemLocList.length;
    if(itemTotal > 2){
      for(let i = 0; i < itemTotal; i += 3){
        game_log("compounding " + itemName);
        const item1 = character.items[itemLocList[i]];
        const item2 = character.items[itemLocList[i+1]];
        const item3 = character.items[itemLocList[i+2]];
        if(item1 && item2 && item3){
          const grade = item_grade(item1);
          let scrollName = "";
          if(grade == 0){
            scrollName = "cscroll0";
          }else if(grade == 1){
            scrollName = "cscroll1";
          }else if(grade == 2){
            scrollName = "cscroll2";
          }
          const scrollSlot = locate_item(scrollName);
          if(scrollSlot == -1){
            buy(scrollName).then(() => {
              compounding = true;
              compound(itemLocList[i], itemLocList[i+1], itemLocList[i+2], scrollSlot).then(() => {
                itemLocList.slice(0,3);
                compounding = false;
              });
            });
          }else{
            compounding = true;
            compound(itemLocList[i], itemLocList[i+1], itemLocList[i+2], scrollSlot).then(() => {
              itemLocList.slice(0,3);
              compounding = false;
            });
          }
        }
      }
    }else{
      game_log('done compounding ' + itemName + ' +' + itemLevel);
      delete compoundTargets[itemName][itemLevel];
    }
  }else{
    game_log('done compounding all ' + itemName);
    delete compoundTargets[itemName];
  }


}, 1000/4);

// use regen skill
setInterval(() => {
	if(can_use("regen_hp") && character.max_hp - character.hp > 1){
		use_skill("regen_hp");
	}
	if(can_use("regen_mp") && character.max_mp - character.mp > 1){
		use_skill("regen_mp");
	}
}, 1000/4);

load_code("utils");

makeButton("switchState", () => {
	if(state === State.IDLE){
		state = State.NOTAFK;
	}else{
		state = State.IDLE;
	};
});

makeButton("show", () => {
  show_json(mluckTargets)
  show_json(lootTargets);
  show_json(upgradeTargets);
  show_json(compoundTargets);
  show_json(sellTargets);
});

// control character state
function stateController(){
	if(mluckTargets.length && state == State.IDLE){
		stop();
		state= State.MLUCK;
	}
	
	if(lootTargets.length  && state == State.IDLE){
		stop();
		state= State.LOOT;
	}
	
	if(upgradeTargets.length  && state == State.IDLE){
		stop();
		state= State.UPGRADE;
	}
	
	if(Object.keys(compoundTargets).length  && state == State.IDLE){
		stop();
		state= State.COMPOUND;
	}
	
	if(sellTargets.length  && state == State.IDLE){
		stop();
		state= State.SELL;
	}
}

// idling at town with merch stand open
function idling(){
	if(is_moving(character)) return;
	if(character.map != "main" || character.x != -91 || character.y != 7){
		// set stat and log
		smart_move({x:-91, y:7, map:"main"});
	}else{
		openMerchStand();
	}
}

// cast mluck skill to player in mluckTargets
function castMluck(){
	if(!mluckTargets.length && state == State.MLUCK) state = State.IDLE;
	if(!mluckTargets.length || is_moving(character)) return;
	
	closeMerchStand();
	const party = get_party();
	const x = party[mluckTargets[0]].x;
	const y = party[mluckTargets[0]].y;
	const map = party[mluckTargets[0]].map;
  const target = get_player(mluckTargets[0]);
	if(target != null && !is_in_range(target, 'mluck') || target == null){
		smart_move({x: x, y: y, map: map});
	}else if(target != null){
		if(!target.s.mluck  || target.s.mluck.ms < 120000 || target.s.mluck.f != character.name){
			use_skill('mluck', target)
		}else{
			mluckTargets.shift();
		}
	}
}

// retrieve loots from farmer and manage (upgrade, sell, bank) them
function manageLoot(){
	if(!lootTargets.length && state == State.LOOT) state = State.IDLE;
	if(!lootTargets.length || is_moving(character) || is_moving(character)) return;
	game_log('managing loots');
	
	closeMerchStand();
	const party = get_party();
	const x = party[lootTargets[0]].x;
	const y = party[lootTargets[0]].y;
	const map = party[lootTargets[0]].map;
	const target = get_player(lootTargets[0]);
	if(target != null && !is_in_range(target, 'mluck') || target == null){
		smart_move({x: x, y: y, map: map});
		game_log('going to target');
	}else if(target != undefined){
		if(!target.s.mluck  || target.s.mluck.ms < 1800000 || target.s.mluck.f != character.name){
			use_skill('mluck', target)
		}
		game_log('loot: wait');
	}  
}

// register loots to upgrade, compound, and sell target
function registerLoots(){
  compoundTargets = {};
  upgradeTargets = [];
	for(var i = 0; i < 43; i++){
		const item = character.items[i]
		if(item){
			const upgradeLevel = upgradeWhitelist[item.name];
			if(upgradeLevel && item.level && item.level < upgradeLevel){
				upgradeTargets.push(i);
			}else{
        const compoundLevel = combineWhitelist[item.name];
        console.log(item.level);
        console.log(item.name);
        if(compoundLevel && typeof item.level == 'number' && item.level < compoundLevel ){
          console.log('queueable');
          if(compoundTargets[item.name]){
            console.log('item name already exist')
            if(compoundTargets[item.name][item.level]){
              if(!compoundTargets[item.name][item.level].includes(i)){
                console.log('queued')
                compoundTargets[item.name][item.level].push(i);
              }else{
                console.log('queued')
                compoundTargets[item.name][item.level] = [i];
              }
            }else{
              console.log('queued')
              compoundTargets[item.name][item.level] = [i];
            }
          }else{
            console.log('queued')
            compoundTargets[item.name] = {[item.level] : [i]};
          }
        }
      }
		}
	}
  // show_json(upgradeTargets);
  // show_json(compoundTargets);
}

// check is merch stand is active
function isMerchStandActive() {
	return character.stand != false;
}

// Open merch stand
function openMerchStand() {
	if (!isMerchStandActive()) {
		parent.open_merchant(0);
	}
}

// Close merch stand
function closeMerchStand() {
	if (isMerchStandActive()) {
		parent.close_merchant(0);
	}
}

let count = 0;
const warrior: any = {};
const mage: any = {};
const priest: any = {};
on_cm = (from: string, data: any) => {
	if (is_me(from)) {
		if (data.message === "pos") {
			smart_move(data.x, data.y);
			if (!character.moving) {
				characters.forEach((value, index) => {
					send_cm(value, "gold");
				});
			}
		} else if (data.message === "home") {
			count++;
			if (count >= 3) {
				count = 0;
				smart_move("main");
			}
		} else if (data.message === "data") {
			if (from === "notlusW") {
				warrior["name"] = data.name;
				warrior["gold"] = data.gold;
				warrior["hp"] = data.hp;
				warrior["max_hp"] = data.max_hp;
				warrior["xp"] = data.xp;
				warrior["max_xp"] = data.max_xp;
				warrior["x"] = data.x.toFixed(2);
				warrior["y"] = data.y.toFixed(2);
				warrior["map"] = data.map;
			} else if (from === "notlusssRa") {
				mage["name"] = data.name;
				mage["gold"] = data.gold;
				mage["hp"] = data.hp;
				mage["max_hp"] = data.max_hp;
				mage["xp"] = data.xp;
				mage["max_xp"] = data.max_xp;
				mage["x"] = data.x.toFixed(2);
				mage["y"] = data.y.toFixed(2);
				mage["map"] = data.map;
			} else if (from === "notlussPr") {
				priest["name"] = data.name;
				priest["gold"] = data.gold;
				priest["hp"] = data.hp;
				priest["max_hp"] = data.max_hp;
				priest["xp"] = data.xp;
				priest["max_xp"] = data.max_xp;
				priest["x"] = data.x.toFixed(2);
				priest["y"] = data.y.toFixed(2);
				priest["map"] = data.map;
			}
			
		} else if (data.message === "mluck") {
			if(!mluckTargets.includes(data.name))
        mluckTargets.push(data.name);
		} else if (data.message === "loot") {
			if(!lootTargets.includes(data.name))
			lootTargets.push(data.name);
		} else if (data.message === "loot:done") {
			for( var i = 0; i < lootTargets.length; i++){
				if ( lootTargets[i] === data.name){
					lootTargets.splice(i, 1);
				}
      }
      game_log(data.name);
      registerLoots();
		}else{
			show_json(data);
		}
	}
};

const merchant = {
	name: character.name,
	gold: character.gold,
	hp: character.hp,
	max_hp: character.max_hp,
	xp: character.xp,
	max_xp: character.max_xp,
	x: character.x.toFixed(2),
	y: character.y.toFixed(2),
	map: character.map
}

setInterval(() => {
	party = get_party();
	characters.forEach((value, index) => {
		send_cm(value, { message: "data" });
		if(!party[value]) send_party_invite(value);
	})
	const obj = [warrior, mage, priest, merchant];
	const response = fetch("http://68.183.227.231:6969/", {
	method: 'POST',
	body: JSON.stringify(obj),
	headers: {'Content-Type': 'application/json; charset=UTF-8'} });
}, 1000);
map_key("1", "snippet", "parent.stop_runner();");
map_key("2", "snippet", "parent.start_runner();");
map_key("3", "snippet", 'load_code("merchant")');
