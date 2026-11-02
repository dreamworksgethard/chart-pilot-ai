import { useCallback, useState } from 'react'
import { LoadingScreen } from './components/LoadingScreen'
import { Home } from './components/Home'
import './App.css'
import './components/Home.css'

function App() {
  const [ready, setReady] = useState(
    () => new URLSearchParams(window.location.search).has('skip'),
  )
  const handleComplete = useCallback(() => setReady(true), [])

  return (
    <div className="app">
      {!ready && <LoadingScreen onComplete={handleComplete} />}

      <div className={`app__enter ${ready ? 'app__enter--visible' : ''}`}>
        <Home />
      </div>
    </div>
  )
}

export default App
