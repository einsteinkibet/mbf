
import React from 'react';
import { FaLightbulb, FaBullseye, FaUsers } from 'react-icons/fa';

const VissionMission = () => {
  return (
    <section className="container mt-5">
      <div className="row text-center">
        <div className="col-md-4" data-aos="zoom-in">
          <FaLightbulb className="icon" />
          <h2 className="text-primary fw-bold">Our Vision</h2>
          <p className="animated-text">To nurture roots to grow and wings to fly for our pupils.</p>
        </div>
        <div className="col-md-4" data-aos="zoom-in">
          <FaBullseye className="icon" />
          <h2 className="text-primary fw-bold">Our Mission</h2>
          <p className="animated-text">To be a center of affordable quality learning responsive to modern challenges.</p>
        </div>
        <div className="col-md-4" data-aos="zoom-in">
          <FaUsers className="icon" />
          <h2 className="text-primary fw-bold">Core Values</h2>
          <ul className="list-unstyled animated-list">
            <li>Humility</li>
            <li>Excellence</li>
            <li>Accountability</li>
            <li>Respect</li>
            <li>Teamwork</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VissionMission;