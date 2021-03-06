import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import App from './App'

const main = App

const drivers = {
  DOM: makeDOMDriver('#root')
}

run(main, drivers)
