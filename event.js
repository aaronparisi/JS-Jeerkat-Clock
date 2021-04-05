export const deleteEvent = (toDelete) => {
  toDelete.remove();
}

export const withinEventBorder = (event, mouseX) => {
  return (
    Math.abs(calculateLeft(event) + calculateWidth(event) - mouseX) < 5 ||
    Math.abs(calculateLeft(event) - mouseX) < 5
  )
}

export const getStartTime = event => {
  return parseInt(event.dataset.startTime)
}

export const setStartTimeFromLocation = event => {
  let newStart = Math.floor(event.offsetLeft / 50)
  if (! roundingDown(event)) {
    newStart += 1
  }
  setStartTime(event, newStart)
  
  let newEnd = calculateEventEndTime(event)
  setEndTime(event, newEnd)
}

export const setStartTime = (event, newStart) => {
  event.dataset.startTime = newStart
}

export const calculateEventEndTime = (event) => {
  // generates the endTime of the event based off of the startTime and the duration
  return getStartTime(event) + getDuration(event)
}

export const getEndTime = event => {
  return parseInt(event.dataset.endTime)
}

export const setEndTime = (event, newEnd) => {
  event.dataset.endTime = newEnd
}

export const getDragOriginLeft = event => {
  return parseInt(event.dataset.dragOriginLeft)
}

export const setDragOriginLeft = (event, newDrag) => {
  event.dataset.dragOriginLeft = newDrag
}

export const getDuration = event => {
  return parseInt(event.dataset.duration)
}

export const setDuration = (event, newDuration) => {
  event.dataset.duration = newDuration
}

export const isSelected = event => {
  return event.dataset.selected === "true"
}

export const select = (event, mouseX) => {
  event.dataset.selected = "true"
  event.id = "selected-event"
  setDragOriginLeft(event, event.offsetLeft)
  setOffsetX(event, (event.offsetLeft - mouseX))
}

export const unSelect = (event, events) => {
  snapUpOrDown(event, events)
  setDragOriginLeft(event, event.offsetLeft)
  event.dataset.selected = "false"
  event.id = ""
}

export const getOffsetX = event => {
  return parseInt(event.dataset.offsetX)
}

export const setOffsetX = (event, newX) => {
  event.dataset.offsetX = newX
}

export const calculateLeft = event => {
  let leftEle = document.getElementById(`time-block-${event.dataset.startTime}`)
  return leftEle.offsetLeft + 2.5
}

export const setLeft = (event, xVal) => {
  event.style.left = `${xVal}px`
}

export const move = (event, mouseX, minX, maxX) => {
  let newX = mouseX + getOffsetX(event)

  if (newX < minX) {
    newX = minX
  } else if (newX + event.offsetWidth > maxX) {
    newX = maxX - event.offsetWidth - 2.5
  }

  setLeft(event, newX)
  setStartTimeFromLocation(event)
}

export const calculateWidth = event => {
  return (event.dataset.duration * 50) - 5
}

export const calculateDistToLeftSlot = event => {
  return event.offsetLeft % 50;
}

export const calculateDistToRightSlot = event => {
  return 50 - calculateDistToLeftSlot(event)
}

export const hoveringOver = (event) => {
  // returns an array of integers
  // representing indexes of time blocks over which
  // the given event is hovering
  const ret = [];

  for (let i=getStartTime(event); i<getEndTime(event); i++) {
    ret.push(i)
  }

  return ret;
}

export const collidesWithEvent = (event, otherEvent) => {
  // returns true if the otherEvent overlaps at all with event
  // else, false
  const eventHovers = hoveringOver(event)
  const otherHovers = hoveringOver(otherEvent)
  
  return eventHovers.filter(e => otherHovers.includes(e)).length !== 0
}

export const collidesWithAny = (selected, events) => {
  // returns true if selected is "hovering" over a slot that has
  // an event already
  
  // an event is "hovering" over a slot if the event would snap to that slot
  // on a mouseup event
  return events.filter(event => collidesWithEvent(selected, event)).length > 0
}

export const roundingDown = event => {
  return (calculateDistToLeftSlot(event) < calculateDistToRightSlot(event))
}

export const snapUpOrDown = (selected, events) => {
  let newLeft;
  if (collidesWithAny(selected, events)) {
    // snap back to original location
    newLeft = selected.dataset.dragOriginLeft
  } else if (roundingDown(selected)) {
    // snap down
    newLeft = selected.offsetLeft - calculateDistToLeftSlot(selected) + 2.5
  } else {
    // snap up
    newLeft = selected.offsetLeft + calculateDistToRightSlot(selected) + 2.5
  }

  setLeft(selected, newLeft)
}