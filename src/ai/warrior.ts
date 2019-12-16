import { makeButton, is_me, characters } from "../utils/utils"
import { start_attacking, State } from "./character";
let map;
let state = State.ATTACK_MODE;
load_code('utils')
setInterval(() => {
    map = get_map()
    switch (state) {
        case State.ATTACK_MODE:
            start_attacking(state);
            if(character.ctype === "priest"){
                let current_sum = 0;
                let max_sum = 0;
 
                let war = get_player("WarriorJorbo")                
                if(war.max_hp - max.hp < 100){
                    heal("WarriorJorbo")
                }
            }
            break;
        case State.GIVE_GOLD:
            send_gold("Patreon", character.gold * .90);
            state = State.ATTACK_MODE;
            send_cm("Patreon", { message: "home" });
            break;
    }
}, 1000 / 4);

makeButton("attack", () => {
    state = State.ATTACK_MODE;
});

on_cm = (from: string, data: any) => {    
    if (is_me(from)) {
        if (data.message === "data") {            
            send_cm("Patreon", {
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
