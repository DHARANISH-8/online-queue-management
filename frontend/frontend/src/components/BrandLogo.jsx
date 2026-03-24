import React from 'react';
import logo from '../assets/apollo_logo-removebg-preview.png';
import './BrandLogo.css';

const BrandLogo = ({ showTagline = true, compact = false, className = '' }) => {
    return (
        <div className={`apollo-brand ${compact ? 'compact' : ''} ${className}`.trim()}>
            <img src={logo} alt="ApolloQ logo" className="apollo-brand-logo" />
            <div className="apollo-brand-text">
                <span className="apollo-brand-title">apolloQ</span>
                {showTagline && <span className="apollo-brand-subtitle">Apollo Hospitals Queue Management</span>}
            </div>
        </div>
    );
};

export default BrandLogo;
