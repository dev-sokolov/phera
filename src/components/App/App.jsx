import { Routes, Route } from "react-router-dom";

import HomePage from "../../pages/HomePage/HomePage";
import ResultPage from "../../pages/ResultPage/ResultPage";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";

import "../../shared/styles/style.css";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App;

