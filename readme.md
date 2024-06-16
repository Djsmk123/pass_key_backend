
# Passkey Authentication with Express.js

This application demonstrates how to implement passkey authentication using Express.js, integrating with a MongoDB database and utilizing the `@simplewebauthn/server` library.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

### Configuration

Create a `.env` file in the root directory with the following environment variables:

```plaintext
PORT=8080
MONGODB_URI=<your-mongodb-uri>
LOCAL_IP=localhost
```

### Running the Application

Start the Express server:

```bash
npm start
```

The server will start running at `http://localhost:8080` by default.

## Endpoints

### `/register/start`

- **Method:** POST
- **Description:** Initiates the registration process for passkey authentication.
- **Request Body:**
  ```json
  {
    "username": "user123"
  }
  ```
- **Response:**
  ```json
  {
    "challenge": "<base64-encoded-challenge>",
    "rp": {
      "name": "CredMan App Test",
      "id": "blogs-deeplink-example.vercel.app"
    },
    "user": {
      "name": "user123",
      "displayName": "user123"
    },
    "pubKeyCredParams": [
      {
        "type": "public-key",
        "alg": -7
      }
    ],
    "timeout": 60000,
    "attestationType": "none",
    "authenticatorSelection": {
      "authenticatorAttachment": "platform",
      "requireResidentKey": false,
      "userVerification": "required"
    },
    "excludeCredentials": []
  }
  ```

### `/register/complete`

- **Method:** POST
- **Description:** Completes the registration process after user approval.
- **Request Body:**
  ```json
  {
    "challenge": "<base64-encoded-challenge>",
    "username": "user123",
    "response": "<response-data>"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Registration successful",
    "data": {
      "userId": "<user-id>",
      "username": "user123"
      // other user data
    },
    "token": "<jwt-token>"
  }
  ```

### `/login/start`

- **Method:** GET
- **Description:** Initiates the login process and retrieves authentication options.
- **Response:**
  ```json
  {
    "challenge": "<base64-encoded-challenge>",
    "rpId": "blogs-deeplink-example.vercel.app",
    "allowCredentials": [
      {
        "type": "public-key",
        "id": "<credential-id>",
        "transports": ["internal"]
      }
    ]
  }
  ```

### `/login/complete`

- **Method:** POST
- **Description:** Completes the login process after user approval.
- **Request Body:**
  ```json
  {
    "id": "<credential-id>",
    "challenge": "<base64-encoded-challenge>",
    "response": "<response-data>"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "userId": "<user-id>",
      "username": "user123"
      // other user data
    },
    "token": "<jwt-token>"
  }
  ```

### `/me`

- **Method:** GET
- **Description:** Protected route that requires a JWT token to access. Returns user information based on the token.
- **Response:**
  ```json
  {
    "user": {
      "userId": "<user-id>",
      "username": "user123"
      // other user data
    }
  }
  ```

## Credits

This project uses the `@simplewebauthn/server` library for WebAuthn functionality. For more details, refer to their [documentation](https://github.com/MasterKale/simplewebauthn).
