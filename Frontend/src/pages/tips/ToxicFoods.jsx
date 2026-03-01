import React from "react";
import { Container, Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const ToxicFoodsTips = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <style>{`
                .tips-hero {
                    height: 650px;
                    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://www.harmonyanimalhospital.net/wp-content/uploads/2022/08/What-Fruits-Can-Dogs-Eat.jpg');
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
                    <h1>Safe vs Toxic Foods Guide</h1>
                </Container>
            </header>

            <main className="content-section">
                <div className="paragraph-block">
                    <h2>The Danger of Table Scraps</h2>
                    <p>
                        Feeding table scraps is common in Sri Lankan households, but many traditional ingredients
                        are toxic to pets. A single grape or a bit of onion in your curry can cause severe health
                        complications. As a loving owner, you need to know exactly what is safe for your furry
                        friend's bowl and what should stay on your plate.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>Common Toxic Ingredients</h2>
                    <p>
                        Items like onions and garlic, which are staples in local curries, can cause fatal hemolytic
                        anemia in both dogs and cats. Chocolate and caffeine are also highly toxic, attacking the
                        nervous system and heart. Grapes and raisins can lead to sudden kidney failure, and
                        even excessive spices like chili can cause severe digestive distress.
                    </p>
                </div>

                <div className="paragraph-block">
                    <h2>Safe Local Alternatives</h2>
                    <p>
                        Fortunately, there are many safe Sri Lankan treats your pet can enjoy in moderation.
                        Boiled, unseasoned chicken is an excellent source of protein. Cooked pumpkin is
                        wonderful for digestion, and papaya (without seeds) is a nutrient-rich tropical treat
                        that most pets love. Always stick to plain, unprocessed options to keep them safe.
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

export default ToxicFoodsTips;
