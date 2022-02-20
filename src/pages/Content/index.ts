import { SKIP, AUTOPLAY, NEXTEPISODE, FULLSCREEN } from '../../keys'

async function getState<T extends any>(key: string) {
  let error: T | null = null
  const value = (
    await chrome.storage.local.get(key).catch((err) => (error = err))
  )[key]

  return [value, error]
}

async function setState<T extends any>(key: string, value: T) {
  let error: any | null = null
  await chrome.storage.local.set({ [key]: value }).catch((err) => (error = err))
  return error
}

const click = new MouseEvent('click')

let barIndexSet = false

;(async () => {
  const [fullscreen] = await getState(FULLSCREEN)
  if (fullscreen) {
    document
      .querySelectorAll(
        '.header, .info_panel, .sidebar, .footer, [title="Открыть мобильную версию сайта"]'
      )
      ?.forEach((element) => element.setAttribute('style', 'display: none'))
    document
      .querySelector('#my-player')
      ?.setAttribute(
        'style',
        'position: fixed; z-index: 999; top: 0; left: 0; width: 100vw; height: 100vh;'
      )
  }
})()

window.setInterval(async () => {
  const [autoplay] = await getState(AUTOPLAY)
  const [skip] = await getState(SKIP)
  const [nextEpisode] = await getState(NEXTEPISODE)
  const [fullscreen] = await getState(FULLSCREEN)

  if (skip) {
    const skipButton = document.querySelector(
      '[title="Нажмите, если лень смотреть опенинг"]'
    )
    if (skipButton) {
      const hidden = skipButton.classList.contains('vjs-hidden')
      if (!hidden) skipButton.dispatchEvent(click)
    }
  }

  if (autoplay) {
    const nextButton = document.querySelector(
      '[title="Перейти к следующему эпизоду"]'
    )
    if (nextButton) {
      const hidden = nextButton.classList.contains('vjs-hidden')
      if (!hidden) {
        nextButton.dispatchEvent(click)
        setState(NEXTEPISODE, true)
        if (document.querySelector('[title="Не на весь экран"]'))
          setState(FULLSCREEN, true)
      }
    }
  }

  if (autoplay && nextEpisode) {
    const playButton = document.querySelector('.vjs-big-play-button')
    if (playButton) {
      playButton.dispatchEvent(click)
      setState(NEXTEPISODE, false)
    }
  }

  if (fullscreen && !barIndexSet) {
    const bar = document.querySelector('.vjs-control-bar')
    console.log(bar)
    if (bar) {
      bar.setAttribute('style', 'z-index: 1001;')
      barIndexSet = true
    }
  }
}, 1000)
