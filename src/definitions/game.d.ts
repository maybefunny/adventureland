import { promises } from "fs";
import { Resolve } from "webpack";

type ItemName = string; // TODO: Same as with skills
export interface ICharacter extends Entity {
  party?: string;
  name: string;
  range: number;
  items: (ItemInfo | undefined)[];
  ctype: string;
  rip: boolean;
  gold: number;
  xp: number;
  max_xp: number;
  moving: boolean;
  map: string;
  esize: number;
  stand: boolean;
}

export type EntityId = string;

export interface Drawing {
  destroy: () => void;
}

export interface ItemInfo {
  level?: number;
  q?: number;
  name: string;
  g?: number;
}

export interface BuffInfo {
  f: string;
  // duration in ms
  ms: number;
}

export interface Entity {
  name?: string;
  id?: string;
  real_x?: number;
  real_y?: number;
  x: number;
  y: number;
  going_x?: number;
  going_y?: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  attack: number;
  target: string;
  xp: number;
  type: string;
  mtype?: string;
  transform?: any;
  dead: boolean;
  npc?: boolean;
  range: number;
  // Buffs are 's' ???? -_-
  s: { [T in keyof SkillName]: BuffInfo };
}

export interface mluck {
  ms: number;
}

export interface Monster extends Entity {
  mtype: string;
  id: string;
  range: number;
}

export interface SkillInfo {
  mp?: number;
  name: number;
  cooldown: number;
  ratio?: number;
  range?: number;
}

export interface GameInfo {
  skills: { [T in SkillName]: SkillInfo };
  items: { [T in ItemName]: ItemInfo };
  monsters: { [id: string]: Monster };
}

export interface server {
  mode: string;
  pvp: boolean;
  region: string;
  id: string;
}

declare global {
  interface Window {
    $: any;
    clear_game_logs(): void;
    party_list: string[];
    party: { [name: string]: ICharacter };
    entities: { [id: string]: Entity };
    start_runner(): void;
    stop_runner(): void;
  }
  var $: any;
  var character: ICharacter;
  var server: server;
  var game_logs: any[];
  var G: GameInfo;
  var clear_game_logs: () => void;
  var handle_death: () => void;
  function respawn(): void;
  function start_character(name: string, script: string): void;
  function stop_character(name: string, script: string): void;
  function map_key(key: string, thing: string, arg?: string): void;
  function can_use(skill: SkillName | string): boolean;
  function can_attack(entity: Entity): boolean;
  function buy_with_gold(item: ItemName, q: number): void;
  function use(skill: SkillName, target?: Entity): void;
  function heal(entity: Entity): void;
  function attack(entity: Entity): void;
  function loot(): void;
  function upgrade(itemPos: number, scrollPos: number, offeringPos?: number): Promise<Resolve>;
  function compound(item1Pos: number, item2Pos: number, item3Pos: number, scrollPos: number, offeringPos?: number): Promise<Resolve>;
  function load_code(foo: string): void;
  function send_cm(to: string, data: any): void;
  function game_log(msg: string, color?: string): void;
  function accept_party_invite(from: string): void;
  function send_party_invite(to: string): void;
  function request_party_invite(to: string): void;
  function set_message(msg: string): void;
  function get_player(name: string): Entity | undefined;
  function change_target(target: Entity, send?: boolean): void;
  function get_target_of(entity: Entity): Entity | undefined;
  function distance(entity1: Entity, entity2: Entity): number;
  function move(x: number, y: number): void;
  function xmove(x: number, y: number): void;
  function smart_move(x: number, y: number): void;
  function smart_move(location: string): void;
  function smart_move(locattion: Object): void;
  function show_json(stuff: any): void;
  function can_move(args: { map?: string; x: number; y: number; going_x?: number; going_y?: number }): boolean;
  function stop(what: string): void;
  function send_gold(name: string, amount: number): void;
  function draw_circle(x: number, y: number, radius: number, size?: number, color?: number): Drawing;
  function draw_line(x: number, y: number, x2: number, y2: number, size?: number, color?: number): Drawing;
  function use_hp_or_mp(): void;
  function get_targeted_monster(): Monster;
  function get_nearest_monster(args: object): Monster;
  function is_in_range(target: Entity, skill?: string): boolean;
  function is_moving(entity: Entity): boolean;
  function send_item(reciever: string | undefined, num: number, quantity: number): void;
  function item_grade(item: ItemInfo): number;
  function locate_item(name: string): number;
  function buy(name: string, q?: number): Promise<Resolve>;
  function sell(num: number, q: number): void;
  function use_skill(name: string, target?: Entity): void;
  function get_party(): {[index:string]: ICharacter};
  function change_server(region: string, name: string): void;
  function performance_trick(): void;
  function pause(): void;

  var handle_command: undefined | ((command: string, args: string) => void);
  var on_cm: undefined | ((from: string, data: any) => void);
  // var on_map_click: undefined | ((x: number, y: number) => boolean);
  var on_party_invite: undefined | ((from: string) => void);
  var on_party_request: undefined | ((from: string) => void);
}

export type SkillName =
  | "use_town"
  | "move_right"
  | "blink"
  | "mluck"
  | "gm"
  | "darkblessing"
  | "move_up"
  | "supershot"
  | "move_left"
  | "interact"
  | "phaseout"
  | "revive"
  | "stack"
  | "charge"
  | "partyheal"
  | "3shot"
  | "quickpunch"
  | "rspeed"
  | "taunt"
  | "stomp"
  | "stop"
  | "shadowstrike"
  | "pure_eval"
  | "cburst"
  | "hardshell"
  | "use_mp"
  | "burst"
  | "toggle_inventory"
  | "toggle_stats"
  | "agitate"
  | "poisonarrow"
  | "warcry"
  | "mcourage"
  | "use_hp"
  | "curse"
  | "toggle_character"
  | "travel"
  | "5shot"
  | "move_down"
  | "esc"
  | "toggle_run_code"
  | "attack"
  | "heal"
  | "track"
  | "absorb"
  | "toggle_code"
  | "open_snippet"
  | "throw"
  | "invis"
  | "cleave"
  | "energize"
  | "light"
  | "snippet"
  | "4fingers"
  | "quickstab"
  | "magiport"
  | "pcoat"
  | "scare"
  | "holidayspirit";
