import xs from 'xstream'
import isolate from '@cycle/isolate'

function intent (domSource) {
  return domSource
    .select('.text-input')
    .events('input')
    .map(e => ({
      name: e.target.name,
      value: e.target.value
    }))
}

function model (props$, action$) {
  return props$
    .map(props => action$
      .startWith({
        name: props.name,
        value: ''
      })
    )
    .flatten()
    .remember()    
}

function view (props$, state$) {
  return xs
    .combine(props$, state$)
    .map(([ props, state ]) => 
      <div>
        {
          props.multi
            ? <textarea className='text-input' name={ props.name } value={ state.value } placeholder={ props.label } />
            : <input className='text-input' type={ props.type } name={ props.name } value={ state.value } placeholder={ props.label } />
        }
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

function IsolatedTextInput (sources) {
  return isolate(TextInput)(sources)
}

export default IsolatedTextInput
