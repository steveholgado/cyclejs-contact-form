import xs from 'xstream'
import Form from './Form'

function App (sources) {

  // Create contact form using Form component
  const form = Form(sources)

  // Do something with data stream returned from contact form
  form.data.addListener({
    next: data => alert(JSON.stringify(data))
  })

  const sinks = {
    DOM: form.DOM
  }
  
  return sinks

}

export default App
