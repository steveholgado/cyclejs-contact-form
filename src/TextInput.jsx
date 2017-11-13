import xs from 'xstream'

function intent (domSource) {
  return domSource
    .select('.text-input')
    .events('input')
    .map(e => e.target.value)
}

function model (props$, action$) {
  return action$
    .startWith('')
}

function view (props$, state$) {
  return xs
    .combine(props$, state$)
    .map(([ props, value ]) => 
      <div>
        <label>{ props.label }</label>
        <input type={ props.type } value={ value } className="text-input" />
      </div>
    )
}

function TextInput (sources) {

  const action$ = intent(sources.DOM)
  const state$  = model(sources.props, action$)
  const vtree$  = view(sources.props, state$)

  const sinks = {
    DOM: vtree$,
    value: state$
  }

  return sinks

}

export default TextInput
