import fs from "fs";
export const characters = ["WarriorJorbo", "WizardJorbo", "FatherJorbo", "Patreon"];
export function makeButton(name: string, callback: () => void) {
    const $ = parent.$;
    const tlc = $("#topleftcorner");
    tlc.find(`#${name}div`).empty();
    $(`#${name}div`).remove()
    const button = $(`<div id="${name}div"></div>`).html(`<button class="gamebutton" id="${name}">${name}</button>`);
    button.appendTo(tlc);
    $(`#${name}div`).click(callback);
}

export function clearGameLog() {
    const $ = parent.$;
    const gamelog = $("#gamelog");
    gamelog.empty();
}

export function clearChat() {
    const $ = parent.$;
    const chat = $("#chatlog");
    chat.empty();
}

export function is_me(name: string) {    
    return characters.includes(name);
}

handle_command = (command, args) => {
    if (command === "clear") {
        clearGameLog();
        game_log("Game Log Cleared")
    } else if (command === "clearchat") {
        clearChat();
        game_log("Chat Cleared")
    }
    else if(command === "inviteall"){
        characters.forEach((value, index) => {
            send_party_invite(value);13
        });
    } 
};
on_party_invite = (from: string) => {
    if (is_me(from)){
        accept_party_invite(from);
    }
}

