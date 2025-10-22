import { useState, useCallback } from "react";

// a generic hook for making authenticated api calls
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      // explicitly define headers
      const baseHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // merge headers from options if they exist
      const headers = Object.assign({}, baseHeaders, options.headers);

      // merge all options
      const fetchOptions = Object.assign({}, options, {
        headers: headers
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, fetchOptions);

      if (!response.ok) {
        let errorData;
        let errorMessage: string;

        try {
          errorData = await response.json();
        } catch (e) {
          // if parsing json fails, use status text
          if (response.statusText) {
            errorMessage = response.statusText;
          } else {
            errorMessage = 'an unknown error occurred';
          }
          throw new Error(errorMessage);
        }

        // check for a 'detail' property on the error data
        if (errorData && errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          errorMessage = 'an unknown error occurred';
        }
        throw new Error(errorMessage);
      }
      
      // handle no-content responses (like a successful post)
      if (response.status === 204) {
        return null as T;
      }

      return await response.json() as T;

    } catch (err: any) {
      setError(err.message);
      throw err; // re-throw for the caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, execute, setError };
};
