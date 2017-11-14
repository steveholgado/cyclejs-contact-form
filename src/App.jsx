import xs from 'xstream'
import ContactForm from './ContactForm'

function App (sources) {

	// Create contact form using ContactForm component
  const contactForm = ContactForm(sources)

  // Do something with data stream returned from contact form
  contactForm.data.addListener({
    next: data => alert(JSON.stringify(data))
  })

  const sinks = {
    DOM: contactForm.DOM
  }
  
  return sinks

}

export default App
