/** Floor transition helpers — P5-5: stairs descent */
import * as GL from './GameLoop'
import type { DungeonData } from './DungeonPCG'
import { getThemeForFloor } from '../data/floors'
import { generateDungeon, buildScene } from './DungeonPCG'
import type { MobKit } from '../entities/MobKit'
import { GameRenderer } from '../render/GameRenderer'
import { PlayerKit } from '../kits/playerKit'
import { Minimap } from '../render/Minimap'
import { Goblin } from '../entities/Goblin'
import { Shade } from '../entities/Shade'
import { Stalker } from '../entities/Stalker'
import { Skeleton } from '../entities/Skeleton'
import { Bat } from '../entities/Bat'
import { Ogre } from '../entities/Ogre'
import { Mummy } from '../entities/Mummy'
import { Spider } from '../entities/Spider'
import { Wolf } from '../entities/Wolf'
import { Zombie } from '../entities/Zombie'
import { Harpy } from '../entities/Harpy'
import { Troll } from '../entities/Troll'
import { Lich } from '../entities/Lich'
import { Phantom } from '../entities/Phantom'
import { Elemental } from '../entities/Elemental'
import { Boss } from '../entities/Boss'
import { updateFloor } from '../app/uiHelpers'
import { showToast } from './ToastSystem'

const makeMob = (r: GameRenderer, i: number): MobKit => {
  const fns: (() => MobKit)[] = [
    () => new Goblin(r), () => new Shade(r), () => new Stalker(r), () => new Skeleton(r), () => new Bat(r),
    () => new Ogre(r), () => new Mummy(r), () => new Spider(r), () => new Wolf(r), () => new Zombie(r),
    () => new Harpy(r), () => new Troll(r), () => new Lich(r), () => new Phantom(r), () => new Elemental(r),
  ]
  return fns[i % fns.length]()
}

export interface TransitionDeps {
  renderer: GameRenderer
  player: PlayerKit
  dungeonSeed: number
  playerHP: number
  playerMaxHP: number
  playerX: number
  playerZ: number
  playerFloor: number
  mobs: MobKit[]
  combatLogEntries: string[]
  minimap: Minimap | null
}

export function showFloorToast(floor: number, addCombatLog: (msg: string) => void): void {
  const msg = `⬇ Descended to Floor ${floor}`
  showToast(msg, { type: 'door', duration: 2500 })
  addCombatLog(msg)
}

export function spawnMobs(renderer: GameRenderer, dungeon: DungeonData, mobs: MobKit[]): void {
  const count = dungeon.rooms.length - 1
  for (let i = 1; i <= count; i++) {
    const r = dungeon.rooms[i]
    const mob = makeMob(renderer, i)
    mob.setPosition(r.cx - dungeon.width / 2 + (Math.random() - 0.5) * 2, 0, r.cy - dungeon.height / 2 + (Math.random() - 0.5) * 2)
    mobs.push(mob)
  }
}

export function spawnBoss(renderer: GameRenderer, floor: number, dungeon: DungeonData, mobs: MobKit[]): void {
  if (floor >= 4 && dungeon.rooms.length > 2) {
    const br = dungeon.rooms[dungeon.rooms.length - 1]
    const boss = new Boss(renderer)
    boss.setPosition(br.cx - dungeon.width / 2, 0, br.cy - dungeon.height / 2)
    mobs.push(boss)
  }
}

export function advanceToFloor(floor: number, deps: TransitionDeps): void {
  const { renderer, player, dungeonSeed, playerHP, playerMaxHP, mobs: mobsArr, combatLogEntries } = deps
  const theme = getThemeForFloor(floor)
  const newDungeon = generateDungeon(dungeonSeed, floor, theme)
  renderer.clearScene()
  buildScene(renderer, newDungeon)
  mobsArr.forEach(m => { if (m.mesh.parent) m.mesh.parent.remove(m.mesh) })
  mobsArr.length = 0
  spawnMobs(renderer, newDungeon, mobsArr)
  spawnBoss(renderer, floor, newDungeon, mobsArr)
  const px = newDungeon.spawnX - newDungeon.width / 2
  const pz = newDungeon.spawnY - newDungeon.height / 2
  player.setPosition(px, 0, pz)
  deps.minimap = new Minimap(newDungeon)
  GL.setDungeonData(newDungeon)
  GL.updateGameVars(playerHP, playerMaxHP, px, pz, 0, floor, mobsArr, combatLogEntries)
  updateFloor(floor)
}
