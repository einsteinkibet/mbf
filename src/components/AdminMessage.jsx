import React from 'react';
import schoolImage from '../assets/schoolImage.jpg';

const AdminMessage = () => {
  return (
    <section className="container mt-5">
      <h2 className="text-center text-primary fw-bold mb-4">Administrator's Message</h2>
      <div className="row align-items-center shadow-lg p-3 mb-5 bg-body rounded">
        <div className="col-md-4 text-center">
          <img src={schoolImage} alt="Admin" className="img-fluid rounded-circle" style={{ width: '150px', height: '150px' }} />
        </div>
        <div className="col-md-8">
          <p className="lead">
            Welcome to Msingi Bora Sigor Academy, where we believe in empowering the next generation of leaders. Our school provides a nurturing environment that encourages creativity, innovation, and personal growth. Join us in shaping a brighter future!
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminMessage;