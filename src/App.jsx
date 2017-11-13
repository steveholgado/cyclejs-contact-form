import xs from 'xstream'
import ContactForm from './ContactForm'

function App (sources) {

  const contactForm = ContactForm(sources)

  // Do something with form data
  contactForm.data.addListener({
    next: data => alert(JSON.stringify(data))
  })

  const sinks = {
    DOM: contactForm.DOM
  }
  
  return sinks

}

export default App
