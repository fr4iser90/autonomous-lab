/**
 * BOILERPLATE_TOY — scaffold demo only. Delete or replace when the real game starts.
 * See BOILERPLATE.md. Not product fantasy.
 */
import { createEconomy, formatEnergy, harvest, step, type EconomyState } from './economy'

const energyNode = document.querySelector('#energy')
const rateNode = document.querySelector('#rate')
const harvestNode = document.querySelector('#harvest')

if (!(energyNode instanceof HTMLElement) || !(rateNode instanceof HTMLElement) || !(harvestNode instanceof HTMLButtonElement)) {
  throw new Error('Missing required #energy, #rate, or #harvest elements')
}

const energyEl: HTMLElement = energyNode
const rateEl: HTMLElement = rateNode
const harvestBtn: HTMLButtonElement = harvestNode

let state: EconomyState = createEconomy(0)

function render(): void {
  energyEl.textContent = formatEnergy(state.energy)
  rateEl.textContent = `+${formatEnergy(state.perTick)} / tick`
}

harvestBtn.addEventListener('click', () => {
  state = harvest(state)
  render()
})

window.setInterval(() => {
  if (state.perTick <= 0) return
  state = step(state)
  render()
}, 500)

render()
