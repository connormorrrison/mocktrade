// stock-trading-simulator/frontend/src/__tests__/ProfilePage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../pages/ProfilePage';
import { UserContext } from '../contexts/UserContext';

// Mock fetch
global.fetch = jest.fn();

const mockUserData = {
    email: "test@example.com",
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    created_at: "2024-01-01T00:00:00.000Z",
    cash_balance: 10000,
    is_active: true,
    id: 1
};

describe('ProfilePage', () => {
    beforeEach(() => {
        // Reset fetch mock
        (global.fetch as jest.Mock).mockReset();
        // Mock localStorage
        Storage.prototype.getItem = jest.fn(() => 'fake-token');
    });

    it('renders profile information correctly', () => {
        render(
            <UserContext.Provider value={{ 
                userData: mockUserData, 
                refreshUserData: jest.fn(),
                setUserData: jest.fn()
            }}>
                <ProfilePage />
            </UserContext.Provider>
        );
        
        expect(screen.getByDisplayValue(mockUserData.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUserData.username)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUserData.first_name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUserData.last_name)).toBeInTheDocument();
    });

    it('handles profile update successfully', async () => {
        const mockRefreshUserData = jest.fn();
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUserData)
            })
        );

        render(
            <UserContext.Provider value={{ 
                userData: mockUserData, 
                refreshUserData: mockRefreshUserData,
                setUserData: jest.fn()
            }}>
                <ProfilePage />
            </UserContext.Provider>
        );
        
        // Click edit button
        fireEvent.click(screen.getByText('Edit Profile'));
        
        // Update first name
        const firstNameInput = screen.getByDisplayValue(mockUserData.first_name);
        fireEvent.change(firstNameInput, { target: { value: 'Updated' } });
        
        // Save changes
        fireEvent.click(screen.getByText('Save Changes'));
        
        await waitFor(() => {
            expect(mockRefreshUserData).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/v1/auth/profile',
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer fake-token',
                        'Content-Type': 'application/json',
                    }
                })
            );
        });
    });

    it('handles password change correctly', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Password changed successfully" })
            })
        );

        render(
            <UserContext.Provider value={{ 
                userData: mockUserData, 
                refreshUserData: jest.fn(),
                setUserData: jest.fn()
            }}>
                <ProfilePage />
            </UserContext.Provider>
        );
        
        // Open password dialog
        fireEvent.click(screen.getByText('Change Password'));
        
        // Fill in password fields
        fireEvent.change(screen.getByLabelText(/Current Password/i), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText(/New Password/i), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
            target: { value: 'newpass123' }
        });
        
        // Submit password change
        fireEvent.click(screen.getByText('Update Password'));
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/v1/auth/change-password',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer fake-token',
                        'Content-Type': 'application/json',
                    }
                })
            );
        });
    });

    it('validates password match', async () => {
        render(
            <UserContext.Provider value={{ 
                userData: mockUserData, 
                refreshUserData: jest.fn(),
                setUserData: jest.fn()
            }}>
                <ProfilePage />
            </UserContext.Provider>
        );
        
        // Open password dialog
        fireEvent.click(screen.getByText('Change Password'));
        
        // Fill in password fields with non-matching passwords
        fireEvent.change(screen.getByLabelText(/Current Password/i), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText(/New Password/i), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
            target: { value: 'differentpass' }
        });
        
        // Submit password change
        fireEvent.click(screen.getByText('Update Password'));
        
        // Check for error message
        expect(await screen.findByText('New passwords do not match')).toBeInTheDocument();
    });
});