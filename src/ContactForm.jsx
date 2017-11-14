import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'

function intent (domSource) {
  return domSource
    .select('.submit')
    .events('click', { preventDefault: true })
}

function model (action$, formFields) {

  const formFieldDOMs   = formFields.map(field => field.DOM)
  const formFieldValues = formFields.map(field => field.value)

  const formDOM$ = xs.combine(...formFieldDOMs)

  const formData$ = action$
    .map(() => xs.combine(...formFieldValues).take(1))
    .flatten()
    .filter(fields => fields.every(field => field.value))
    .map(fields => fields.map(field => ({ [field.name]: field.value }) ))
    .map(fields => Object.assign({}, ...fields))

  return { formDOM$, formData$ }

}

function view (formDOM$) {
  return formDOM$
    .map(formFieldDOMs => 
      <form>
        <h1>Contact Me</h1>
        { formFieldDOMs }
        <button className="submit">Submit</button>
      </form>
    )
}

function ContactForm (sources) {

  const nameProps$    = xs.of({ label: 'Name', name: 'name', type: 'text' })
  const emailProps$   = xs.of({ label: 'Email', name: 'email', type: 'text' })
  const messageProps$ = xs.of({ label: 'Message', name: 'message', type: 'text' })

  const nameInput    = isolate(TextInput)({ DOM: sources.DOM, props: nameProps$ })
  const emailInput   = isolate(TextInput)({ DOM: sources.DOM, props: emailProps$ })
  const messageInput = isolate(TextInput)({ DOM: sources.DOM, props: messageProps$ })

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
