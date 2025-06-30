import React from 'react';

const VisionMission = () => {
  return (
    <section className="container mt-5">
      <div className="row">
        <div className="col-md-4 text-center mb-4">
          <h2 className="text-primary fw-bold">Our Vision</h2>
          <p className="lead">To nurture roots to grow and wings to fly for our pupils.</p>
        </div>
        <div className="col-md-4 text-center mb-4">
          <h2 className="text-primary fw-bold">Our Mission</h2>
          <p className="lead">To be a center of affordable quality learning responsive to modern challenges.</p>
        </div>
        <div className="col-md-4 text-center mb-4">
          <h2 className="text-primary fw-bold">Core Values</h2>
          <ul className="list-unstyled">
            <li className="mb-2">Humility</li>
            <li className="mb-2">Excellence</li>
            <li className="mb-2">Accountability</li>
            <li className="mb-2">Respect</li>
            <li className="mb-2">Teamwork</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;