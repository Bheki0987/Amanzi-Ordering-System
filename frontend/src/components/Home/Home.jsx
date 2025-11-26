// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-logo">
          <span>Amanzi</span> Ordering System
        </div>
        <div className="nav-links">
          <a href="#features">Features </a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQs</a>
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Water Delivery Made Simple</h1>
          <p>Amanzi Ordering System delivers clean water to your doorstep at NWU Mahikeng Campus</p>
          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">Get Started</Link>
            <a href="#how-it-works" className="secondary-btn">Learn More</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/water-delivery.svg" alt="Water Delivery" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose Amanzi?</h2>
          <p>Making water access easy for all students</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💧</div>
            <h3>Clean Water</h3>
            <p>Pure, safe drinking water delivered directly to your residence</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Same-Day Delivery</h3>
            <p>Fast and reliable delivery during our set time slots</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Affordable Pricing</h3>
            <p>Just R4 per liter with no hidden fees</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy Ordering</h3>
            <p>Simple online system to place and track your orders</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get water delivered in 4 simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your NWU student details and residence information</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Place Order</h3>
            <p>Select water quantity and choose a convenient delivery time slot</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Delivery</h3>
            <p>Our provider will deliver water to your residence during the selected time</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Payment</h3>
            <p>Pay cash on delivery and enjoy your clean water</p>
          </div>
        </div>
      </section>

      {/* Residences Section */}
      <section className="residences-section">
        <div className="section-header">
          <h2>We Deliver To All NWU Mahikeng Residences</h2>
          <p>Fast service across the entire campus</p>
        </div>
        <div className="residences-grid">
          <div className="residence-group">
            <h3>Cluster Residences</h3>
            <ul>
              <li>C8</li>
              <li>C9</li>
              <li>C10</li>
              <li>C11</li>
              <li>C12</li>
              <li>C13</li>
            </ul>
          </div>
          <div className="residence-group">
            <h3>Non-Residences</h3>
            <ul>
              <li>Bus Terminal</li>
              <li>A2_F</li>
              <li>A5</li>
              <li>Boss-Mike</li>
            </ul>
          </div>
          <div className="residence-group">
            <h3>East Residences</h3>
            <ul>
              <li>Nelson Mandela Res</li>
              <li>Dr James Moroka</li>
              <li>Kgosi Dick</li>
              <li>Sol Plaatje</li> 
            </ul>
          </div>
          <div className="residence-group">
            <h3>West Residences</h3>
            <ul>
              <li>Lost City</li>
              <li>Khayelitsha</li>
              <li>Hopeville</li>
              <li>Steve Bhiko House</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Students Say</h2>
          <p>Don't take our word for it</p>
        </div>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="quote">"Amanzi saved me during exam week! No more carrying heavy water containers from the shops."</div>
            <div className="student-info">
              <div className="student-name">Thabo M.</div>
              <div className="student-residence">Nelson Mandela Residence</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"The service is reliable and the water is always clean. Worth every rand!"</div>
            <div className="student-info">
              <div className="student-name">Lerato K.</div>
              <div className="student-residence">Cluster 9</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"I've been using Amanzi for the entire semester. They never disappoint with delivery times."</div>
            <div className="student-info">
              <div className="student-name">Michael P.</div>
              <div className="student-residence">James Moroka</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Get answers to common questions</p>
        </div>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How much does delivery cost?</h3>
            <p>Delivery is FREE of charge. You only pay R4 per liter of water with no additional fees.</p>
          </div>
          <div className="faq-item">
            <h3>What are the delivery time slots?</h3>
            <p>We offer two delivery slots: Morning (10:00-12:00) and Evening (18:00-22:00).</p>
          </div>
          <div className="faq-item">
            <h3>How do I pay for my order?</h3>
            <p>We accept cash on delivery only. Please have the exact amount ready to make the transaction quick and easy.</p>
          </div>
          <div className="faq-item">
            <h3>What if I'm not available during delivery?</h3>
            <p>You can ask a roommate or friend to receive the delivery, or reschedule through your dashboard at least 1 hour before the delivery slot.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a minimum order quantity?</h3>
            <p>Yes, our minimum order is 5 liters to make delivery efficient.</p>
          </div>
          <div className="faq-item">
            <h3>How can I become a water provider?</h3>
            <p>If you have reliable water supply and transportation, register as a provider on our platform to start earning!</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready for clean water delivery?</h2>
          <p>Create an account now and place your first order in minutes!</p>
          <Link to="/register" className="primary-btn">Get Started</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>Amanzi</span> Ordering System
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Support</h3>
              <ul>
                <li><a href="#faq">FAQs</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Contact</h3>
              <ul>
                <li>Email: amanzi@support.com</li>
                <li>Phone: 012-345-6789</li>
                <li>NWU Mahikeng Campus</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Amanzi Ordering System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;