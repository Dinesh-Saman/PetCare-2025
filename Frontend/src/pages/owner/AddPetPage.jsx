import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddPetModal from './AddPet';

const AddPetPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClose = () => {
        // If state says we came from home, go back to home
        if (location.state?.fromHome) {
            navigate('/');
        } else {
            navigate('/owner/profile');
        }
    };

    const handlePetAdded = () => {
        navigate('/owner/profile');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <AddPetModal
                open={true}
                onClose={handleClose}
                onPetAdded={handlePetAdded}
            />
        </div>
    );
};

export default AddPetPage;
