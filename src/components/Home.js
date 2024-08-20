import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import animationData from './utils/moovz_white_logo.json';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/page');
    };

    // Configurações da animação
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className="home-container">
            <Lottie options={defaultOptions} height={800} width={800} />
            <button className="vr-button" onClick={handleClick}>
                Iniciar Experiência
            </button>
        </div>
    );
};

export default Home;
