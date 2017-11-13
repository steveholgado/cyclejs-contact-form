import xs from 'xstream'
import isolate from '@cycle/isolate'
import TextInput from './TextInput'

function intent (domSource) {
  return domSource
    .select('.submit')
    .events('click', { preventDefault: true })
}

function model (action$, nameInput, emailInput, messageInput) {

  const formDOM$ = xs
    .combine(nameInput.DOM, emailInput.DOM, messageInput.DOM)

  const formData$ = action$
    .map(() => xs
      .combine(nameInput.value, emailInput.value, messageInput.value)
      .take(1)
    )
    .flatten()
    .filter(([ name, email, message ]) => name && email && message)
    .map(([ name, email, message ]) => ({ name, email, message }))

  return { formDOM$, formData$ }

}

function view (formDOM$) {
  return formDOM$
    .map(([ nameDOM, emailDOM, messageDOM ]) => 
      <form>
        <h1>Contact Me</h1>
        { nameDOM }
        { emailDOM }
        { messageDOM }
        <button className="submit">Submit</button>
      </form>
    )
}

function ContactForm (sources) {

  const nameProps$    = xs.of({ label: 'Name', type: 'text' })
  const emailProps$   = xs.of({ label: 'Email', type: 'text' })
  const messageProps$ = xs.of({ label: 'Message', type: 'text' })

  const nameInput    = isolate(TextInput)({ DOM: sources.DOM, props: nameProps$ })
  const emailInput   = isolate(TextInput)({ DOM: sources.DOM, props: emailProps$ })
  const messageInput = isolate(TextInput)({ DOM: sources.DOM, props: messageProps$ })

  const action$ = intent(sources.DOM)
  const states  = model(action$, nameInput, emailInput, messageInput)
  const vtree$  = view(states.formDOM$)

  const sinks = {
    DOM: vtree$,
    data: states.formData$
  }

  return sinks

}

export default ContactForm
