import { makeButton, clearGameLog, clearChat, is_me, characters } from "utils/utils";

const sleep = time => new Promise((resolve) => setTimeout(resolve, time));

enum State{
  IDLE,
  MLUCK,
  POTS,
  NOTAFK,
  LOOT,
}

let state = State.IDLE;
let mluckTargets = new Array();
let lootTargets = new Array();
let party: any;

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
    case State.NOTAFK:
      set_message('notafk');
      break;
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

makeButton("upgrade", () => {
  const item = prompt("Please enter item name", "goo");
  const maxLevel = prompt("Please enter upgrade max level", "0");
  okBoomer(item, maxLevel);
  set_message('upgrading items');
});

// control character state
function stateController(){
  if(mluckTargets.length){
    stop();
    state=State.MLUCK;
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
  if(!mluckTargets.length || is_moving(character)) return;
  closeMerchStand();
  const target = get_player(mluckTargets[0]);
  const party = get_party();
  const x = party[mluckTargets[0]].x;
  const y = party[mluckTargets[0]].y;
  const map = party[mluckTargets[0]].map;
  if(target != null && !is_in_range(target, 'mluck') || target == null){
    smart_move({
      x: x,
      y: y,
      map: map,
    });
  }else if(target != null){
    if(!target.s.mluck  || target.s.mluck.ms < 120000 || target.s.mluck.f != character.name){
      use_skill('mluck', target)
    }else{
      mluckTargets.shift();
      if(!mluckTargets.length) state = State.IDLE;
    }
  }
}

// retrieve loots from farmer and manage (upgrade, sell, bank) them
function manageLoot(){
  
}

//  Upgrade script
function okBoomer(itemName: string, maxLevel: number) {
    // let itemName = 'pants';
    const inventoryArray = character.items;
    const itemIndex: number[] = [];
    let scrollLoc = 0;

    // Finds the location of the upgrade scrolls
    for (i = 0; i < 42; i++) {
        if (!inventoryArray[i]) continue;
        if (inventoryArray[i].name == 'scroll0') {
            scrollLoc = i;
        }
    }
    // Sets an array of the index of every item to be upgraded 
    for (i = 0; i < 42; i++) {
        if (!inventoryArray[i]) continue;
        if (inventoryArray[i].name == itemName) {
            itemIndex.push(i);
        }
    }
    // Checks if the inventory space of the given index is filled
    function itemExists(item) {
        if (parent.character.items[item]) {
            return true;
        } else {
            return false;
        }
    }
    //  Returns the item level of the item at the given index
    function itemLevel(item) {
        if (itemExists(item)) {
            return parent.character.items[item].level;
        }
    }
    // Recursive function that waits 5 seconds to be called
    function upgradeItem(item, scroll) {
        if (item < itemIndex.length) {


            if (!itemExists(itemIndex[item]) || itemLevel(itemIndex[item]) >= maxLevel) {

                setTimeout(upgradeItem, 250, item + 1, scroll);
            } else {
                upgrade(itemIndex[item], scroll);
                setTimeout(upgradeItem, 250, item, scroll);
            }
        } else {

            return false;
        }
    }
    // upgrade item until maxLevel or no more items in array
    upgradeItem(0, scrollLoc);

    return 0;
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
            } else if (from === "notlusM") {
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
    map: get_map()["name"]
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
