import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Page1 from './components/Page1';
import PageTeste from './components/PageTeste';
import Page2 from './components/Page2';
import Page from './components/Page';
import JsonAnimation from './components/JsonAnimation';
import ImgAnimation from './components/ImgAnimation';
import Video360 from './components/Video360';
import Pagesssssss from './components/Teste';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page" element={<Page />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/pageteste" element={<PageTeste />} />
        <Route path="/jsona" element={<JsonAnimation />} />
        <Route path="/img" element={<ImgAnimation />} />
        <Route path="/video" element={<Video360 />} />
        <Route path="/teste" element={<Pagesssssss />} />

      </Routes>
    </Router>
  );
};

export default App;
