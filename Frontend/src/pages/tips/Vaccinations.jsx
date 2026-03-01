import React from "react";
import { Container, Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const VaccinationTips = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <style>{`
                .tips-hero {
                    height: 650px;
                    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=1600&h=800&fit=crop&q=80');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                    padding: 0 20px;
                }

                .tips-hero h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1.1;
                    letter-spacing: -1px;
                }

                .content-section {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 100px 20px;
                }

                .paragraph-block {
                    margin-bottom: 80px;
                }

                .paragraph-block h2 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                }

                .paragraph-block p {
                    font-size: 1.2rem;
                    line-height: 1.9;
                    color: #475569;
                    margin: 0;
                }

                .footer-nav {
                    margin-top: 60px;
                    display: flex;
                    justify-content: center;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #10b981;
                    font-weight: 700;
                    text-decoration: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: transform 0.2s;
                    padding: 12px 24px;
                    border-radius: 50px;
                    background: #f0fdf4;
                }

                .back-btn:hover {
                    transform: translateX(-5px);
                    background: #dcfce7;
                }

                @media (max-width: 768px) {
                    .tips-hero h1 { font-size: 2.5rem; }
                    .paragraph-block h2 { font-size: 1.75rem; }
                    .paragraph-block p { font-size: 1.1rem; }
                }
            `}</style>

            <header className="tips-hero">
                <Container maxWidth="lg">
                    <h1>Pet Vaccinations Guide</h1>
                </Container>
            </header>

            <main className="content-section">
                <div className="paragraph-block">
                    <h2>Why Vaccination is Vital in Sri Lanka</h2>
                    <p>
                        In Sri Lanka's tropical climate, pets are frequently exposed to life-threatening diseases like Rabies,
                        Parvovirus, and Leptospirosis. Vaccination is not just a personal health choice but a communal responsibility.
                        The Department of Animal Production and Health (DAPH) mandates specific vaccines to maintain public safety
                        and ensure our furry friends live long, healthy lives without the threat of preventable epidemics.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>Core Vaccinations for Dogs</h2>
                    <p>
                        Every dog in Sri Lanka must receive core vaccines, primarily Rabies and the DHLPP combination.
                        Rabies vaccination is legally required, with the first dose typically administered at 3 months followed
                        by annual boosters. The DHLPP vaccine protects against Distemper, Hepatitis, Leptospirosis, Parainfluenza,
                        and Parvovirus, diseases that are highly prevalent in urban areas like Colombo and Gampaha.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>Protecting Your Feline Friends</h2>
                    <p>
                        Cats also require specific protection, even if they stay mostly indoors. The Tricat (FVRCP) vaccine
                        is essential to prevent severe respiratory infections and feline panleukopenia. Additionally,
                        in a country where Rabies remains endemic, vaccinating your cat is a vital precaution. Consult
                        your local veterinarian to set up a schedule that aligns with your cat's lifestyle and local risk factors.
                    </p>
                </div>

                <div className="footer-nav">
                    <div className="back-btn" onClick={() => navigate('/#blog')}>
                        <ArrowLeft size={20} />
                        <span>Back to All Tips</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VaccinationTips;
