import * as eventUtil from './event.js'
import * as timeBlockUtil from './timeBlock.js'

const clockFace = document.querySelector('.time-display')
const meerkatImage = document.querySelector('.meerkat-image')
const timeBlocks = document.querySelectorAll('.time-block')
const timeLineBlocks = document.getElementById('time-blocks')

let selected = null;
let mousePos;

const wakeupEvent = document.getElementById('wakeup-event')
const loungeEvent = document.getElementById('lounge-event')
const fightEvent = document.getElementById('fight-event')
const cuddleEvent = document.getElementById('cuddle-event')
const sleepEvent = document.getElementById('sleep-event')

const eventDeleteButtons = document.querySelectorAll('.event-delete-button')

const events = [
  wakeupEvent,
  loungeEvent,
  fightEvent,
  cuddleEvent,
  sleepEvent
]

const golden_ratio_conjugate = 0.618033988749895

const partyButton = document.querySelector('.party-button')
let partyTime = false;
let amPm = "AM"

const imageSources = {
  wakeup: "./images/meerkat_wakeup.jpg",
  lounge: "./images/meerkat_lounge.jpg",
  fight: "./images/meerkat_fight.jpg",
  cuddle: "./images/meerkat_cuddle.jpg",
  sleep: "./images/meerkat_sleep.jpeg",
  party: "./images/meerkat_party.jpg",
  generic: "./images/meerkat_generic.jpeg"
}

const setImageSrc = time => {
  if (selected !== null || partyTime) {
    return null;
  }

  let wakeupTimeStart = eventUtil.getStartTime(wakeupEvent);
  let wakeupTimeEnd = eventUtil.getEndTime(wakeupEvent);

  let loungeTimeStart = eventUtil.getStartTime(loungeEvent);
  let loungeTimeEnd = eventUtil.getEndTime(loungeEvent);

  let fightTimeStart = eventUtil.getStartTime(fightEvent);
  let fightTimeEnd = eventUtil.getEndTime(fightEvent);

  let cuddleTimeStart = eventUtil.getStartTime(cuddleEvent);
  let cuddleTimeEnd = eventUtil.getEndTime(cuddleEvent);

  let sleepTimeStart = eventUtil.getStartTime(sleepEvent);
  let sleepTimeEnd = eventUtil.getEndTime(sleepEvent);

  if (time >= wakeupTimeStart && time < wakeupTimeEnd) {
    meerkatImage.src = imageSources.wakeup
  } else if (time >= loungeTimeStart && time < loungeTimeEnd) {
    meerkatImage.src = imageSources.lounge
  } else if (time >= fightTimeStart && time < fightTimeEnd) {
    meerkatImage.src = imageSources.fight
  } else if (time >= cuddleTimeStart && time < cuddleTimeEnd) {
    meerkatImage.src = imageSources.cuddle
  } else if (time >= sleepTimeStart && time < sleepTimeEnd) {
    meerkatImage.src = imageSources.sleep
  } else {
    meerkatImage.src = imageSources.generic
  }
}

const setCurTime = () => {
  let d = new Date;
  let hours = d.getHours()
  let minutes = d.getMinutes()
  let seconds = d.getSeconds()
  amPm = "AM"

  setImageSrc(parseInt(hours))

  if (parseInt(hours) >= 12) {
    hours = ((hours-1) % 12) + 1
    amPm = "PM"
  }

  if (parseInt(minutes) < 10) {
    minutes = `0${minutes}`
  }

  if (parseInt(seconds) < 10) {
    seconds = `0${seconds}`
  }

  clockFace.firstElementChild.innerHTML =  `${hours}:${minutes}:${seconds}`
  clockFace.lastElementChild.innerHTML = `${amPm}`
}

const clockLoop = () => {
  setTimeout(() => {
    setCurTime();
    clockLoop();
  }, 1000);
}

const formatEvents = () => {
  events.forEach(event => {
    event.style.left = `${eventUtil.calculateLeft(event)}px`
    event.style.width = `${eventUtil.calculateWidth(event)}px`

    event.addEventListener('mousedown', e => {
      if (e.button === 0 && selected === null && ! e.target.classList.contains('event-delete-button')) {
        handleEventMouseDown(e)
      }
    })

    event.addEventListener('click', e => {
      if (eventUtil.withinEventBorder(e.currentTarget, e.clientX)) {
        console.log('clicked border')
      }
    })
  })

  eventDeleteButtons.forEach(delBtn => {
    delBtn.addEventListener('click', e => {
      eventUtil.deleteEvent(e.currentTarget.parentElement)
      setImageSrc();
      events = events.filter(event => event.id !== e.currentTarget.parentElement.id)
    })
  })

  document.addEventListener('mouseup', e => {
    if (e.button === 0 && selected !== null) {
      handleEventMouseUp(e)
    }
  })
}

const handleEventMouseDown = e => {
  e.currentTarget.id = 'clicked-event'
  eventUtil.select(e.currentTarget, e.clientX)
  selected = e.currentTarget
}

const handleEventMouseUp = e => {
  selected.id = ''
  eventUtil.unSelect(selected, unSelectedEvents())  // ! passing a lot around...
  selected = null;
  setImageSrc(parseInt(new Date().getHours()));
  timeBlockUtil.unHoverAll()
}

const unSelectedEvents = () => {
  return events.filter(event => event.dataset.selected === "false")
}

const highlightTimeBlocks = () => {
  timeBlockUtil.unHoverAll();
  
  if (! eventUtil.collidesWithAny(selected, unSelectedEvents())) {
    const hoveredBlocks = timeBlockUtil.blocksHoveredBy(selected, Array.from(timeBlocks))
    hoveredBlocks.forEach(tb => timeBlockUtil.hover(tb))
  }
}

const hsl_to_rgb = (h, s, v) => {
  // * i copied this from
  // * https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

  let h_i = Math.floor(h*6)
  let f = h*6 - h_i
  let p = v * (1 - s)
  let q = v * (1 - f*s)
  let t = v * (1 - (1 - f) * s)
  
  let r, g, b;

  switch (h_i) {
    case 0:
      // r, g, b = v, t, p
      r = v
      g = t
      b = p
      break;
    case 1:
      // r, g, b = q, v, p
      r = q
      g = v
      b = p
      break;
    case 2:
      // r, g, b = p, v, t
      r = p
      g = v
      b = t
      break;
    case 3:
      // r, g, b = p, q, v
      r = p
      g = q
      b = v
      break;
    case 4:
      // r, g, b = t, p, v
      r = t
      g = p
      b = v
      break;
      case 5:
      // r, g, b = v, p, q
      r = v
      g = p
      b = q
      break;
    default:
      break;
  }
  return `rgb(${Math.floor(r*256)}, ${Math.floor(g*256)}, ${Math.floor(b*256)})`
}

const backgroundParty = () => {
  if (! partyTime) {
    return
  }

  let h = Math.random()
  h += golden_ratio_conjugate
  // h = Math.floor(h)
  h %= 1

  let s = .5
  let l = .95

  document.body.style.removeProperty('background-color')
  document.body.style.backgroundColor = hsl_to_rgb(h, s, l)

  setTimeout(() => {
    backgroundParty()
  }, 100);
}

const endParty = () => {
  document.body.style.removeProperty('background-color')
  document.body.style.cssText += `background-color: #E1695F`

  partyTime = false;
  partyButton.disabled = false;
}

const startParty = () => {
  partyTime = true;
  meerkatImage.src = imageSources.party
  partyButton.classList.remove('party-hover')
  partyButton.disabled = true;
  backgroundParty();
  
  setTimeout(() => {
    endParty()
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  setImageSrc(null)
  setCurTime();
  clockLoop();
  formatEvents();

  document.addEventListener('mousemove', e => {
    if (selected !== null) {
      mousePos = {
        x: e.clientX,
      }

      eventUtil.move(selected, mousePos.x, 2.5, timeLineBlocks.offsetWidth)
      highlightTimeBlocks();
    }
  })

  partyButton.addEventListener('click', () => {
    startParty()
  })

  partyButton.addEventListener('mouseenter', e => {
    partyButton.classList.add('party-hover')
  })
  partyButton.addEventListener('mouseleave', e => {
    partyButton.classList.remove('party-hover')
  })
})

// todo
// - drag buttons to change durationy