import requests

# Set the base URL of your API
base_url = "http://localhost:8000/api/v1"

# Set the user's credentials
credentials = {
    "username": "maxwick@email.com",
    "password": "password123"
}

# Send a POST request to the login endpoint
login_response = requests.post(f"{base_url}/auth/login", data=credentials)

# Check the login response status code
if login_response.status_code == 200:
    # If the authentication is successful, extract the JWT token from the response
    token = login_response.json().get("access_token")
    print("Authentication successful. JWT Token:", token)

    # Set the headers with the JWT token
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Make a GET request to the /transactions endpoint
    transactions_response = requests.get(f"{base_url}/trading/transactions", headers=headers)

    # Check the transactions response status code
    if transactions_response.status_code == 200:
        # If the request is successful, print the transactions
        transactions = transactions_response.json()
        print("User Transactions:")
        for transaction in transactions:
            print(transaction)
    else:
        # If the request fails, print the error message
        print(f"Error retrieving transactions: {transactions_response.status_code} - {transactions_response.text}")
else:
    # If the authentication fails, print the error message
    print(f"Authentication failed: {login_response.status_code} - {login_response.text}")