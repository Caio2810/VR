import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from './assets/moovzlogo.png';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/page');
    };

    return (
        <div className="home-container">
            <img src={logoImage} alt="Logo" className="logo" />
            <button className="vr-button" onClick={handleClick}>
                Iniciar Experiência
            </button>
        </div>
    );
};

export default Home;