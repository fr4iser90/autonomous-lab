/** Ashen Delve — Thin entry point */
import {
  initTitleScreen,
  initButtonHandlers,
  initVolumeSliders,
  initEventListeners,
  startGame,
  startTutorialGame,
  initBossSummon,
} from './app/ui'
// Re-exports for testing
export { showScreen } from './app/ui'
export { gameState, currentScreen } from './app/ui'
export { updateHP, updateFloor, updateDepth, updateStatusEffects } from './app/ui'
export { playerHP, playerMaxHP, playerFloor } from './app/ui'
export { combatLogEntries, mobs } from './app/ui'
export { combatEngine, inventory, chaseAI, economy, skillTree, audio, lootManager, gameLoop, GL } from './app/ui'
export { Boss } from './entities/Boss'

initTitleScreen()
initButtonHandlers(startGame, startTutorialGame)
initVolumeSliders()
initEventListeners(startGame)
initBossSummon()
