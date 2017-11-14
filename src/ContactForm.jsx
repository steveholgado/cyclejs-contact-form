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
  const formFieldDOMs   = formFields.map(field => field.DOM)
  const formFieldValues = formFields.map(field => field.value)

  // Combine DOM trees from form inputs into new stream
  const formDOM$ = xs.combine(...formFieldDOMs)

  // Map clicks on submit button to an object of field names and values
  const formData$ = action$
    // Map clicks to combined form input value streams
    // Take just 1 per click or stream will emit on every change
    .map(() => xs.combine(...formFieldValues).take(1))
    .flatten()
    // Filter out submits where any field is empty
    .filter(fields => fields.every(field => field.value))
    // Map field object to new object with name as key
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    // Combine each form field name/value objects into a single object
    .map(fields => Object.assign({}, ...fields))

  return { formDOM$, formData$ }

}

function view (formDOM$) {
  return formDOM$
    .map(formFieldDOMs => 
      <form>
        <h1>Contact Me</h1>
        { formFieldDOMs }
        <button className='submit'>Submit</button>
      </form>
    )
}

function ContactForm (sources) {

  // Create props streams for form input fields
  const nameProps$    = xs.of({ label: 'Name', name: 'name', type: 'text' })
  const emailProps$   = xs.of({ label: 'Email', name: 'email', type: 'text' })
  const messageProps$ = xs.of({ label: 'Message', name: 'message', type: 'text' })

  // Create form input fields using TextInput component
  const nameInput    = isolate(TextInput)({ DOM: sources.DOM, props: nameProps$ })
  const emailInput   = isolate(TextInput)({ DOM: sources.DOM, props: emailProps$ })
  const messageInput = isolate(TextInput)({ DOM: sources.DOM, props: messageProps$ })

  // Create array of form input components
  const formInputs = [nameInput, emailInput, messageInput]

  const action$ = intent(sources.DOM)
  const states  = model(action$, formInputs)
  const vtree$  = view(states.formDOM$)

  const sinks = {
    DOM: vtree$,
    data: states.formData$
  }

  return sinks

}

export default ContactForm
