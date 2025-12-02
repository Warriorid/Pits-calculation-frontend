export const saveUserSession = (username: string, role: number, token: string) => {
    localStorage.setItem('username', username);
    localStorage.setItem('role', role.toString());
    localStorage.setItem('token', token);
};

export const loadUserSession = () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    if (username && token) {
        return {
            username,
            role: role ? parseInt(role) : 0,
            token
        };
    }
    return null;
};

export const clearUserSession = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
};