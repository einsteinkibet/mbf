import React, { useEffect } from 'react';
import './Home.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from './Header';
import VissionMission from './VissionMission';
import StudyCorner from './StudyCorner';
import AdminMessage from './AdminMessage';

// Bootstrap JS Import (If not imported in main.jsx)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Images
import carousel1 from '../assets/carousel1.jpg';
import carousel2 from '../assets/carousel2.jpg';
import carousel3 from '../assets/carousel3.jpg';

// FontAwesome Icons
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <div className="home-container">
      <Header />

      {/* Main Carousel */}
      <div id="homeCarousel" className="carousel slide mt-5" data-bs-ride="carousel">
        {/* Indicators */}
        <div className="carousel-indicators">
          {[...Array(3)].map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Carousel Items */}
        <div className="carousel-inner">
          {[carousel1, carousel2, carousel3].map((image, index) => (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`} data-aos="fade-up">
              <img src={image} className="d-block w-100 carousel-img" alt={`Slide ${index + 1}`} />
              <div className="carousel-caption">
                <h5 className="legendary-text">{['Excellence in Learning', 'Innovation and Growth', 'Building Future Leaders'][index]}</h5>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"><FaArrowLeft /></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"><FaArrowRight /></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <VissionMission />
      <StudyCorner />
      <AdminMessage />

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Msingi Bora Sigor Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;