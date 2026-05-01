import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HistoryProvider } from './context/HistoryContext.jsx'
import Home from './pages/Home.jsx'
import Nathys from './pages/Nathys.jsx'
import Elisa from './pages/Elisa.jsx'
import Parents from './pages/Parents.jsx'
import Test from './pages/Test.jsx'

export default function App() {
  return (
    <HistoryProvider>
      <BrowserRouter basename="/tache-app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nathys" element={<Nathys />} />
          <Route path="/elisa" element={<Elisa />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/test" element={<Test />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HistoryProvider>
  )
}
