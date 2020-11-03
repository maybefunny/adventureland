import { makeButton, clearGameLog, clearChat, is_me } from "utils/utils";

const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
const array = ["notlusW", "notlusM", "notlussPr"];
load_code("utils");
makeButton("getgold", () => {
    send_cm("notlusW", "pos");
});

//  Upgrade script
function okBoomer(itemName: string) {
    // Set this to the name of the item to upgrade
    const maxLevel: number = 7;
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
                game_log('else')
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

makeButton("upgrade", () => {
    okBoomer("shoes");
});
let count = 0;
const warrior: any = {};
const mage: any = {};
const priest: any = {};
on_cm = (from: string, data: any) => {
    if (is_me(from)) {
        if (data.message === "pos") {
            smart_move(data.x, data.y);
            if (!character.moving) {
                array.forEach((value, index) => {
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
    array.forEach((value, index) => {
        send_cm(value, { message: "data" });
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
