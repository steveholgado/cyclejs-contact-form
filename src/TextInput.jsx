import xs from 'xstream'

function intent (domSource) {
  return domSource
    .select('.text-input')
    .events('input')
    .map(e => ({
      name: e.target.name,
      value: e.target.value
    }))
}

function model (action$) {
  return action$
    .startWith({
      name: '',
      value: ''
    })
}

function view (props$, state$) {
  return xs
    .combine(props$, state$)
    .map(([ props, state ]) => 
      <div>
        <label>{ props.label }</label>
        <input className='text-input' type={ props.type } name={ props.name } value={ state.value }  />
      </div>
    )
}

function TextInput (sources) {

  const action$ = intent(sources.DOM)
  const state$  = model(action$)
  const vtree$  = view(sources.props, state$)

  const sinks = {
    DOM: vtree$,
    value: state$
  }

  return sinks

}

export default TextInput
