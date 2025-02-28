import { useEffect, useState } from "react";

const PasswordStrength = ({ password }) => {
    const [strength, setStrength] = useState(0);
    
    useEffect(() => {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        setStrength(Math.min(4, score));
    }, [password]);

    return (
        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                    strength < 2 ? "bg-red-500" :
                    strength < 3 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${(strength / 4) * 100}%` }}
            />
        </div>
    );
};

export default PasswordStrength;