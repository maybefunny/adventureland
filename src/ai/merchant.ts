import { stat } from "fs";
import { makeButton, is_me, characters } from "utils/utils";

performance_trick();

const defaultServerRegion = "US";
const defaultServerName = "I";

enum State{
	IDLE,
	SPIRITS,
	MLUCK,
	POTS,
	NOTAFK,
	LOOT,
	SELL,
  UPGRADE,
  WTF,
	COMPOUND,
}

let upgrading:boolean = false;
let compounding:boolean = false;
let state = State.IDLE;
let mluckTargets: Array<string> = [];
let lootTargets: Array<string> = [];
let upgradeTargets: Array<number> = [];
let compoundTargets: {[index: string]: { [index: string]: Array<number>}} = {};
let sellTargets = new Array();
let party: any;
let buyingScroll:boolean = false;

// Upgrade variables
const upgradeMaxLevel = 9; //Max level it will stop upgrading items at if enabled
const gold_start = 1000000; // start upgrading at this much gold
const gold_limit = 50000; // stop upgrading at this much gold

const upgradeWhitelist: {[index: string]: number} = {
	// ItemName, Max Level
	"gloves1": 6,
	"coat1": 6,
	"helmet1": 6,
	"pants1": 6,
	"shoes1": 6,
	"wshoes": 6,
	"wcap": 6,
	"wattire": 6,
	"wbreeches": 6,
	"wgloves": 6,
	'quiver': 8,
	'hbow': 7,
	'dagger': 7,
	'ornamentstaff': 7,
	'candycanesword': 7,
	'merry': 6,
	'mittens': 7,
	't2bow': 6,
	// 'gcape': 6,
	'sword': 6,
	'hgloves': 6,
	'hboots': 6,
	'hhelmet': 6,
	'basher': 6
};

const combineWhitelist: {[index: string]: number} = {
	//ItemName, Max Level
	wbook0: 1,
	lostearring: 1,
	strearring: 1,
	intearring: 1,
	dexearring: 1,
	strring: 1,
	intring: 1,
	dexring: 1,
	dexamulet: 1,
	intamulet: 1,
	stramulet: 1,
	vitearring: 1,
	dexbelt: 1,
	intbelt: 1,
	strbelt: 1
};

const sellWhitelist = [
	'stinger',
	'hpamulet',
	"shield",
	"hpbelt",
	"ringsj",
	"vitring",
	'xmassweater',
	'xmaspants',
	'xmasshoes',
	'xmashat',
	'xmace',
	'warmscarf',
	'iceskates',
	'mushroomstaff',
	'throwingstars',
	'slimestaff',
	'snowball',
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
		case State.SPIRITS:
		set_message('spirits');
		get_holiday_spirits();
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

// loot upgrading handler
setInterval(() => {
	if(!upgradeTargets.length && state == State.UPGRADE) state = State.IDLE;
  if(upgrading || state != State.UPGRADE || !upgradeTargets.length || is_moving(character)) return;
  
  closeMerchStand();
  if(character.map != "main" || character.x != -312 || character.y != -73){
    smart_move({x: -312, y: -73, map: "main"});
    return;
  }
	
	const index = upgradeTargets[0]
	const item = character.items[index];
	if(item && item.level != undefined ){
    const targetLevel = upgradeWhitelist[item.name];
    // for(let i = 0; i < item.level; i++){}
		if(item.level < targetLevel){
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
			if(scrollSlot == -1 && !buyingScroll){
        buyingScroll = true;
				buy(scrollName).then(() => {
          buyingScroll = false;
					upgrading = true;
					upgrade(index, scrollSlot).then(() => {
						upgrading = false;
					}).catch(() => {
            upgrading = false;
          });
				}).catch(() => {
          buyingScroll = false;
          upgradeTargets.shift();
        });
			}else{
				upgrading = true;
				upgrade(index, scrollSlot).then(() => {
					upgrading = false;
				}).catch(() => {
          upgrading = false;
        });
			}
		}else{
      console.log("popped (max level): " + index);
			upgradeTargets.shift();
		}
  }else{
    console.log("popped (item not found || level is not number): " + index);
    upgradeTargets.shift();
  }
}, 750);

// loot combining handler
setInterval(() => {
  if(!Object.keys(compoundTargets).length && state == State.COMPOUND) state = State.UPGRADE;
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
          if(scrollSlot == -1 && !buyingScroll){
            buyingScroll = true;
            buy(scrollName, 1).then(() => {
              buyingScroll = false;
              compounding = true;
              compound(itemLocList[i], itemLocList[i+1], itemLocList[i+2], scrollSlot).then(() => {
                registerLoots();
                compounding = false;
              }).catch(() => {
                registerLoots();
                compounding = false;
              }).finally(() => {
                registerLoots();
                compounding = false;
              });
            }).catch((reason) => {
              if(reason == "cost")
              return;
            });
          }else{
            compounding = true;
            compound(itemLocList[i], itemLocList[i+1], itemLocList[i+2], scrollSlot).then(() => {
              registerLoots();
              compounding = false;
            }).catch(() => {
              registerLoots();
              compounding = false;
            }).finally(() => {
              registerLoots();
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

// loot selling handler
setInterval(() => {
  if(!sellTargets.length && state == State.SELL) state = State.COMPOUND;
  if(state !== State.SELL || !sellTargets.length || is_moving(character)) return;
  
  closeMerchStand();
  if(character.map != "main" || character.x != -312 || character.y != -73){
    smart_move({x: -312, y: -73, map: "main"});
    return;
  }

  const itemToSell = sellTargets[0]
  const item = character.items[itemToSell];
  if(item){
    sell(itemToSell, 1);
  }
  sellTargets.shift();
}, 1000/4);

// use regen skill
setInterval(() => {
	if(can_use("regen_hp") && character.max_hp - character.hp > 1){
		use_skill("regen_hp");
	}
	if(can_use("regen_mp") && character.max_mp - character.mp > 1){
		use_skill("regen_mp");
	}
  
	if(character.rip){
	  respawn();
	}
}, 1000/4);

load_code("utils");

makeButton("registerLoot", () => {
	registerLoots();
});

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
	let newState = State.IDLE;
	if(mluckTargets.length && (state == State.IDLE || state == State.SPIRITS)){
		stop();
		state = State.MLUCK;
	}

	// if(!character.s.holidayspirit && state == State.IDLE){
	// 	stop();
	// 	state = State.SPIRITS;
	// }
	
	if(lootTargets.length && (state == State.IDLE || state == State.SPIRITS)){
    	stop();
		if(character.esize>20) state = State.LOOT;
		else registerLoots();
	}
	
	if(sellTargets.length  && (state == State.IDLE || state == State.SPIRITS)){
		stop();
		state = State.SELL;
	}else if(upgradeTargets.length  && (state == State.IDLE || state == State.SPIRITS)){
		stop();
		state = State.UPGRADE;
	}else if(Object.keys(compoundTargets).length  && (state == State.IDLE || state == State.SPIRITS)){
		stop();
		state = State.COMPOUND;
	}
}

// get holiday spirits from christmas tree
function get_holiday_spirits(){
  if(!smart.moving) smart_move({ to:"town"});
	parent.socket.emit("interaction",{type:"newyear_tree"});
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
      console.log("----upgrade test----");
      const upgradeLevel = upgradeWhitelist[item.name];
      console.log(item.name);
      console.log(upgradeLevel);
			if(upgradeLevel && item.level != undefined && item.level < upgradeLevel){
        console.log('queued');
				upgradeTargets.push(i);
      }
      
      console.log("----compound test----");
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
      
      if(sellWhitelist.includes(item.name)){
        sellTargets.push(i);
      }
		}
	}
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
			if( (typeof data.server_region != "undefined" && typeof data.server_id != "undefined") && (data.server_region != server.region || data.server_id != server.id)){
				game_log("moving to " + data.server_region + data.server_id);
				if(!(state === State.UPGRADE || state === State.SELL || state === State.COMPOUND))
					setTimeout(() => {
						change_server(data.server_region, data.server_id);
					}, 10 * 1000);
			}
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
			game_log("loot done: " + data.name);
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
	// const response = fetch("http://68.183.227.231:6969/", {
	// method: 'POST',
	// body: JSON.stringify(obj),
	// headers: {'Content-Type': 'application/json; charset=UTF-8'} });
}, 1000);
map_key("1", "snippet", "parent.stop_runner();");
map_key("2", "snippet", "parent.start_runner();");
map_key("3", "snippet", 'load_code("merchant")');
