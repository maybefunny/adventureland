import { makeButton, clearGameLog } from "utils/utils";

const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
const array = ["WarriorJorbo", "WizardJorbo", "FatherJorbo"];

makeButton("getgold", () => {
    array.forEach((value, index) => {
        send_cm(value, "I want gold");
    })
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

on_cm = (from: string, data: any) => {
    game_log(from + " sent a cm");
};

handle_command = (command, args) => {
    game_log(`/${command}`)
    if(command === "clear"){
        clearGameLog();
    }
};
