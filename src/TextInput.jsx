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

function validate ({ validation }, state) {
  let valid = true

  if (validation) {
    if (validation.required && !state.value) valid = false
    if (validation.min && state.value.length < validation.min) valid = false
    if (validation.max && state.value.length > validation.max) valid = false
  }

  return { ...state, valid }
}

function model (props$, action$) {
  return props$
    .map(props => action$
      .startWith({
        name: props.name,
        value: ''
      })
      .map(state => validate(props, state))
    )
    .flatten()
    .remember()
}

function view (props$, state$, submit$) {
  return xs
    .combine(props$, state$, submit$)
    .map(([ props, state, submit ]) => {

      const attrs = {
        className: 'text-input',
        name: props.name,
        placeholder: props.label,
        style: {}
      }
      if (props.validation && props.validation.required) {
        attrs.placeholder += '*'
      }
      if (!state.valid && submit) {
        attrs.style = { border: '1px solid red' }
      }

      return (
        <div>
          {
            props.multi
              ? <textarea { ...attrs } />
              : <input { ...attrs } type={ props.type } />
          }
        </div>
      )
    })
}

function TextInput (sources) {

  const action$ = intent(sources.DOM)
  const state$  = model(sources.props, action$)
  const vtree$  = view(sources.props, state$, sources.submit)

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
