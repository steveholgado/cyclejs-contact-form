import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'

function intent (domSource) {
  return domSource
    .select('.submit')
    .events('click', { preventDefault: true })
}

function model (action$, formFields$) {

  // Separate returned sinks from form inputs into separate arrays
  const formFieldVtrees$ = formFields$.map(fields => fields.map(field => field.DOM))
  const formFieldValues$ = formFields$.map(fields => fields.map(field => field.value))

  // Combine vtrees from form inputs into new stream
  const formFieldVtreesCombined$ = formFieldVtrees$
    .map(vtrees => xs.combine(...vtrees))
    .flatten()

  // Combine values from form inputs into new stream
  const formFieldValuesCombined$ = formFieldValues$
    .map(values => xs.combine(...values))
    .flatten()

  // Map clicks on submit button to an object of field names and values
  const formFieldData$ = action$
    .map(() => formFieldValuesCombined$.take(1))
    .flatten()
    .filter(fields => fields.every(field => field.value))
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    .map(fields => Object.assign({}, ...fields))

  return { formFieldVtreesCombined$, formFieldData$ }

}

function view (formFieldVtreesCombined$) {
  return formFieldVtreesCombined$
    .map(formFieldVtrees => 
      <form>
        { formFieldVtrees }
        <button className='submit'>Submit</button>
      </form>
    )
}

function Form (sources) {

  // Create props streams for form input fields
  const nameProps$    = xs.of({ label: 'Name', name: 'name', type: 'text' })
  const emailProps$   = xs.of({ label: 'Email', name: 'email', type: 'text' })
  const messageProps$ = xs.of({ label: 'Message', name: 'message', multi: true })

  // Create form input fields using TextInput component
  const nameInput    = TextInput({ DOM: sources.DOM, props: nameProps$ })
  const emailInput   = TextInput({ DOM: sources.DOM, props: emailProps$ })
  const messageInput = TextInput({ DOM: sources.DOM, props: messageProps$ })

  // Create array of form input components
  const formInputs$ = xs.of([nameInput, emailInput, messageInput])

  const action$ = intent(sources.DOM)
  const states  = model(action$, formInputs$)
  const vtree$  = view(states.formFieldVtreesCombined$)

  const sinks = {
    DOM: vtree$,
    data: states.formFieldData$
  }

  return sinks

}

function IsolatedForm (sources) {
  return isolate(Form)(sources)
}

export default Form
