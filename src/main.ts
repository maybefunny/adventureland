load_code(2);

var attack_mode = true

setInterval(function () {

    use_hp_or_mp();
    loot();

    if (!attack_mode || character.rip || is_moving(character)) return;

    var target = get_targeted_monster();
    if (!target) {
        target = get_nearest_monster({ min_xp: 100, max_att: 120 });
        if (target) change_target(target);
        else {
            set_message("No Monsters");
            return;
        }
    }

    if (!is_in_range(target)) {
        move(
            character.x + (target.x - character.x) / 2,
            character.y + (target.y - character.y) / 2
        );
        // Walk half the distance
    }
    else if (can_attack(target)) {
        set_message("Attacking");
        attack(target);
    }

}, 1000 / 4); // Loops every 1/4 seconds.
character.on("cm", (object) => {
    if (object.name === "Patreon") {
        if (object.message === "I want gold") {
            send_cm("Patreon", { message: "pos", x: parent.character.real_x, y: parent.character.real_y })
        }
        else if (object.message === "trade gp") {
            send_gold("Patreon", character.gold * .90);
            send_cm("Patreon", "go home");
        }
    }
});