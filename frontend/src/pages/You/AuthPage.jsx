import { useLocation, useNavigate } from 'react-router-dom';
import SignInAndUp from './SignInAndUp';

function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleClose = () => {
        if (location.key === 'default') {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    return (
        <SignInAndUp onClose={ handleClose } />
    )
}

export default AuthPage;
