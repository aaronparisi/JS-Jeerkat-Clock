import { hoveringOver } from "./event.js"

export const hover = (timeBlock) => {
  timeBlock.classList.add('time-block-hover')
}

export const unHover = (timeBlock) => {
  timeBlock.classList.remove('time-block-hover')
}

export const unHoverAll = () => {
  document.querySelectorAll('.time-block-hover').forEach(timeBlock => {
    unHover(timeBlock)
  })
}

export const getHour = block => {
  return parseInt(block.dataset.hour)
}

export const blocksHoveredBy = (event, blocks) => {
  // given an event,
  // returns an array of all timeBlocks that event is covering
  const idxs = hoveringOver(event)

  const ret = blocks.filter(block => {
    return idxs.includes(getHour(block))
  })
  
  return ret;
}