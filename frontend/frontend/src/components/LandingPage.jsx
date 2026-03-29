import BrandLogo from './BrandLogo';
import './LandingPage.css';

const featureCards = [
  {
    title: 'Real-time Tracking',
    description:
      'Monitor the live queue status from anywhere and know exactly when your token is called.',
    icon: 'pulse',
  },
  {
    title: 'Online Slot Booking',
    description:
      'Reserve consultations in advance, choose your doctor, and reach only when needed.',
    icon: 'calendar',
  },
  {
    title: 'Smart Notifications',
    description:
      'Receive automated updates for queue movement, delays, and consultation reminders.',
    icon: 'bell',
  },
  {
    title: 'Easy Patient Journey',
    description:
      'A simple interface designed to keep booking, tracking, and check-in in one place.',
    icon: 'phone',
  },
];

const navItems = ['How it Works', 'Departments', 'Find a Doctor', 'Support'];

const howItWorksSteps = [
  {
    title: 'Create your account',
    description: 'Sign in once to manage bookings, queue status, and visit updates from one place.',
  },
  {
    title: 'Choose a department or doctor',
    description: 'Find the right specialty, pick a doctor, and reserve an available consultation slot.',
  },
  {
    title: 'Track your token live',
    description: 'Get real-time queue progress so you only arrive when your turn is getting close.',
  },
];

const departmentCards = [
  {
    title: 'Cardiology',
    description: 'Heart consultations, diagnostics, and follow-up care with queue-aware booking.',
  },
  {
    title: 'Orthopedics',
    description: 'Bone, joint, spine, and sports injury support with faster visit planning.',
  },
  {
    title: 'General Medicine',
    description: 'Everyday physician consultations with simple walk-in and scheduled token handling.',
  },
  {
    title: 'Pediatrics',
    description: 'Child-focused care with smoother appointments and reduced waiting time for families.',
  },
];

const supportDetails = {
  email: 'support@apolloq.com',
  phoneLabel: '+91 98765 43210',
  phoneHref: 'tel:+919876543210',
};

function getNavLinkProps(item, onLogin) {
  if (item === 'Find a Doctor') {
    return {
      href: '#',
      onClick: (event) => {
        event.preventDefault();
        onLogin();
      },
    };
  }

  if (item === 'How it Works') {
    return { href: '#how-it-works' };
  }

  if (item === 'Departments') {
    return { href: '#departments' };
  }

  return { href: '#support' };
}

function Icon({ type }) {
  if (type === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    );
  }

  if (type === 'bell') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 18H5a1 1 0 0 1-.8-1.6l1.3-1.7V10a6 6 0 1 1 12 0v4.7l1.3 1.7A1 1 0 0 1 18 18h-3" />
        <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
      </svg>
    );
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M10 5.5h4M11 18.5h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2" />
      <path d="M4 17c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2" />
    </svg>
  );
}

function LandingPage({ onBookNow, onLogin }) {
  return (
    <div className="landing-shell">
      <div className="landing-page">
        <header className="landing-header">
          <BrandLogo compact />
          <nav className="landing-nav">
            {navItems.map((item) => (
              <a key={item} {...getNavLinkProps(item, onLogin)}>
                {item}
              </a>
            ))}
          </nav>
          <button className="landing-login-link" type="button" onClick={onLogin}>
            Login / Sign in
          </button>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <span className="hero-badge">Smarter, Faster Hospital Visits</span>
            <h1>
              Skip the Waiting Room.
              <br />
              Experience <span>Better Care.</span>
            </h1>
            <p>
              Revolutionize your hospital visit with apolloQ. Manage your place in the queue,
              book consultation slots online, and receive real-time updates from your phone.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" type="button" onClick={onBookNow}>
                Book Now
              </button>
              <a className="hero-secondary" href="#how-it-works">
                Learn More
              </a>
            </div>
            <div className="hero-proof">
              <div className="hero-avatars" aria-hidden="true">
                <span>A</span>
                <span>R</span>
                <span>M</span>
                <span>S</span>
              </div>
              <p>
                Trusted by <strong>10,000+</strong> patients daily
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-frame">
              <div className="visual-hallway" />
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <span className="screen-label">PATIENT FLOW</span>
                  <div className="screen-card">
                    <strong>Dr. Mehta</strong>
                    <span>General Medicine</span>
                  </div>
                  <ul className="screen-list">
                    <li>
                      <span>Token A12</span>
                      <strong>Called</strong>
                    </li>
                    <li>
                      <span>Token A13</span>
                      <strong>2 mins</strong>
                    </li>
                    <li>
                      <span>Token A14</span>
                      <strong>Up next</strong>
                    </li>
                  </ul>
                  <button type="button">Manage Queue</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <h2>Everything you need for a smooth visit</h2>
            <p>
              apolloQ eliminates uncertainty by giving you complete control and visibility over
              your medical appointments.
            </p>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon">
                  <Icon type={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section" id="how-it-works">
          <div className="section-heading section-heading-left">
            <h2>How it works</h2>
            <p>
              apolloQ keeps the visit simple from booking to arrival, so patients spend less time
              waiting and more time getting care.
            </p>
          </div>

          <div className="steps-grid">
            {howItWorksSteps.map((step, index) => (
              <article key={step.title} className="info-card">
                <span className="info-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section" id="departments">
          <div className="section-heading section-heading-left">
            <h2>Departments</h2>
            <p>
              Browse key specialties before you sign in, then continue to login when you want to
              find a doctor and book your visit.
            </p>
          </div>

          <div className="department-grid">
            {departmentCards.map((department) => (
              <article key={department.title} className="info-card department-card">
                <h3>{department.title}</h3>
                <p>{department.description}</p>
                <button type="button" className="department-link" onClick={onLogin}>
                  Find a Doctor
                </button>
              </article>
            ))}
          </div>
        </section>

        <footer className="support-section" id="support">
          <div className="support-copy">
            <span className="support-label">Support</span>
            <h2>Need help before your visit?</h2>
            <p>
              Contact the apolloQ support team for login help, booking assistance, or queue status
              questions.
            </p>
          </div>

          <div className="support-links">
            <a href={`mailto:${supportDetails.email}`}>{supportDetails.email}</a>
            <a href={supportDetails.phoneHref}>{supportDetails.phoneLabel}</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
