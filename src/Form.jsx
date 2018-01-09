import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'
import SubmitButton from './SubmitButton'

function model (formFields$, submit$) {

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
  const formFieldData$ = submit$
    .map(() => formFieldValuesCombined$.take(1))
    .flatten()
    .filter(fields => fields.every(field => field.valid))
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    .map(fields => Object.assign({}, ...fields))

  return { formFieldVtreesCombined$, formFieldData$ }

}

function view (formFieldVtreesCombined$, submitVtree$) {
  return xs.combine(formFieldVtreesCombined$, submitVtree$)
    .map(([ formFieldVtrees, submitVtree ]) => 
      <form>
        { formFieldVtrees }
        { submitVtree }
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
      min: 5,
      max: 10
    }
  })
  const emailProps$ = xs.of({
    label: 'Email',
    name: 'email',
    type: 'text',
    validation: {
      required: true,
      min: 5,
      max: 10
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
  const formInputs$ = xs.of([nameInput, emailInput, messageInput])

  const states = model(formInputs$, submitButton.value)
  const vtree$ = view(states.formFieldVtreesCombined$, submitButton.DOM)

  const sinks = {
    DOM: vtree$,
    data: states.formFieldData$
  }

  return sinks

}

function IsolatedForm (sources) {
  return isolate(Form)(sources)
}

export default IsolatedForm
