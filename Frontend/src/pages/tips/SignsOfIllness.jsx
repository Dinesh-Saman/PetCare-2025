import React from "react";
import { Container, Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const IllnessTips = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <style>{`
                .tips-hero {
                    height: 650px;
                    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=800&fit=crop');
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
                    <h1>Spotting Early Signs of Illness</h1>
                </Container>
            </header>

            <main className="content-section">
                <div className="paragraph-block">
                    <h2>Subtle Behavioral Changes</h2>
                    <p>
                        Pets are masters at hiding pain and illness, a survival instinct from their ancestors.
                        As a responsible owner in Sri Lanka, you need to be observant of subtle shifts in their
                        behavior, appetite, and even how they vocalize. Spotting these signs early can save
                        you heartbreaks and expensive medical bills.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>Key Warning Signs</h2>
                    <p>
                        Be on the lookout for critical changes in your pet's daily routine. Suden loss of interest
                        in food or water is often the first sign of trouble. Conversely, excessive thirst can be
                        an early indicator of kidney issues or diabetes. If your usually active pet is sleeping
                        excessively, avoids play, or hides under furniture, they might be in pain or running a fever.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>When to Consult a Professional</h2>
                    <p>
                        Persistent abnormal vocalization, whining, or unusual meowing can signal acute discomfort
                        or distress. Additionally, shifts in grooming, like a matted coat in cats or obsessive
                        licking in dogs, should never be ignored. If any of these signs persist for more than 24 hours,
                        it's essential to consult a professional clinic to ensure your pet receives timely care.
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

export default IllnessTips;
