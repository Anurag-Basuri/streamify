import { useState } from 'react'

import './App.css'

function App() {
  const [info, setinfo] = useState([]);

  return (
    <div>
      <h1>The informations will display here.</h1>

      {info.map()}
    </div>
  )
}

export default App
