"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    name: string;
    email: string;
    phone: string;
    school: string;
}

interface UserContextType {
    users: User[];
    addUser: (user: User) => void;
    isAdmin: boolean;
    loginAdmin: (email: string, pass: string) => boolean;
    logoutAdmin: () => void;
    uniqueVisitors: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);

    useEffect(() => {
        // Simulate fetching initial data or checking session
        const adminStatus = sessionStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
        
        const storedUsers = sessionStorage.getItem('users');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }

        // Simulate unique visitor count
        const visitorCount = localStorage.getItem('uniqueVisitors');
        if (visitorCount) {
            setUniqueVisitors(parseInt(visitorCount, 10));
        } else {
            const newCount = 1;
            setUniqueVisitors(newCount);
            localStorage.setItem('uniqueVisitors', newCount.toString());
        }

        // This is a simplified way to increment for new "sessions"
        const sessionVisited = sessionStorage.getItem('sessionVisited');
        if (!sessionVisited) {
            const newCount = (visitorCount ? parseInt(visitorCount, 10) : 0) + 1;
            setUniqueVisitors(newCount);
            localStorage.setItem('uniqueVisitors', newCount.toString());
            sessionStorage.setItem('sessionVisited', 'true');
        }

    }, []);

    const addUser = (user: User) => {
        const newUsers = [...users, user];
        setUsers(newUsers);
        sessionStorage.setItem('users', JSON.stringify(newUsers));
    };

    const loginAdmin = (email: string, pass: string) => {
        if (email === 'heybody582@gmail.com' && pass === 'Ritesh@@#3') {
            setIsAdmin(true);
            sessionStorage.setItem('isAdmin', 'true');
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
    };

    return (
        <UserContext.Provider value={{ users, addUser, isAdmin, loginAdmin, logoutAdmin, uniqueVisitors }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
