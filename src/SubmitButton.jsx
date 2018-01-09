import xs from 'xstream'
import isolate from '@cycle/isolate'

function intent (domSource) {
  return domSource
    .select('.submit-button')
    .events('click', { preventDefault: true })
}

function model (props$, action$) {
  return action$
    .mapTo(true)
    .startWith(false)
}

function view (props$) {
  return props$
    .map(props => 
      <button className="submit-button">{ props.text }</button>
    )
}

function SubmitButton (sources) {

  const action$ = intent(sources.DOM)
  const state$  = model(sources.props, action$)
  const vtree$  = view(sources.props)

  const sinks = {
    DOM: vtree$,
    value: state$
  }

  return sinks

}

function IsolatedSubmitButton (sources) {
  return isolate(SubmitButton)(sources)
}

export default IsolatedSubmitButton
