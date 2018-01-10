import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'
import SubmitButton from './SubmitButton'

function model (formFieldValues$, submit$) {

  // Map clicks on submit button to an object of field names and values
  return submit$
    .map(() => formFieldValues$.take(1))
    .flatten()
    .filter(fields => fields.every(field => field.valid))
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    .map(fields => Object.assign({}, ...fields))

}

function view (formFieldVtrees$) {
  return formFieldVtrees$
    .map(formFieldVtrees => 
      <form>
        { formFieldVtrees }
      </form>
    )
}

function Form (sources) {

  // Create submit component
  const submitProps$ = xs.of({ text: 'Submit' })
  const submitButton = SubmitButton({ DOM: sources.DOM, props: submitProps$ })

  // Create props streams for text input fields
  const nameProps$ = xs.of({
    label: 'Name',
    name: 'name',
    type: 'text',
    validation: {
      required: true,
      min: 3,
      max: 20
    }
  })
  const emailProps$ = xs.of({
    label: 'Email',
    name: 'email',
    type: 'text',
    validation: {
      required: true,
      min: 5,
      max: 50
    }
  })
  const messageProps$ = xs.of({
    label: 'Message',
    name: 'message',
    multi: true
  })

  // Create text input components
  const nameInput    = TextInput({ DOM: sources.DOM, props: nameProps$, submit: submitButton.value })
  const emailInput   = TextInput({ DOM: sources.DOM, props: emailProps$, submit: submitButton.value })
  const messageInput = TextInput({ DOM: sources.DOM, props: messageProps$, submit: submitButton.value })

  // Create array of text input components
  const formFieldVtrees$ = xs.combine(nameInput.DOM, emailInput.DOM, messageInput.DOM, submitButton.DOM)
  const formFieldValues$ = xs.combine(nameInput.value, emailInput.value, messageInput.value)

  const state$ = model(formFieldValues$, submitButton.value)
  const vtree$ = view(formFieldVtrees$)

  const sinks = {
    DOM: vtree$,
    data: state$
  }

  return sinks

}

function IsolatedForm (sources) {
  return isolate(Form)(sources)
}

export default IsolatedForm
