export enum State {
    ATTACK_MODE,
    IDLE,
    GIVE_GOLD,
}
export function start_attacking(state: State) {
    use_hp_or_mp();
    loot();

    if (state !== State.ATTACK_MODE || character.rip || is_moving(character)) { return };
    let target;

    target = get_targeted_monster();
    if (!target) {
        if (character.ctype === "warrior") {
            target = get_nearest_monster({ min_xp: 100, max_att: 120 });
        }
        else {
            target = get_target_of(get_player("WarriorJorbo"))
        }
        if (target) {
            change_target(target);
        } else {
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
} else if (can_attack(target)) {
    set_message("Attacking");
    attack(target);
}


}