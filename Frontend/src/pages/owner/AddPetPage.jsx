import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddPetModal from './AddPet';

const AddPetPage = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/owner/profile');
    };

    const handlePetAdded = () => {
        navigate('/owner/profile');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
            <AddPetModal
                open={true}
                onClose={handleClose}
                onPetAdded={handlePetAdded}
            />
        </div>
    );
};

export default AddPetPage;
