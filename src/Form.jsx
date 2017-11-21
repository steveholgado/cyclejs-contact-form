import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'

function intent (domSource) {
  return domSource
    .select('.submit')
    .events('click', { preventDefault: true })
}

function model (action$, formFields) {

  // Separate returned sinks from form inputs into separate arrays
  const formFieldVtrees = formFields.map(field => field.DOM)
  const formFieldValues = formFields.map(field => field.value)

  // Combine DOM trees from form inputs into new stream
  const formVtree$ = xs.combine(...formFieldVtrees)

  // Map clicks on submit button to an object of field names and values
  const formData$ = action$
    .map(() => xs.combine(...formFieldValues).take(1))
    .flatten()
    .filter(fields => fields.every(field => field.value))
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    .map(fields => Object.assign({}, ...fields))

  return { formVtree$, formData$ }

}

function view (formVtree$) {
  return formVtree$
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
  const formInputs = [nameInput, emailInput, messageInput]

  const action$ = intent(sources.DOM)
  const states  = model(action$, formInputs)
  const vtree$  = view(states.formVtree$)

  const sinks = {
    DOM: vtree$,
    data: states.formData$
  }

  return sinks

}

function IsolatedForm (sources) {
  return isolate(Form)(sources)
}

export default Form
