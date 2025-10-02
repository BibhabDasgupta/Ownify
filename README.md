# 🔒 Ownify — Decentralized Device Ownership & Anti-Theft

A blockchain-powered platform for secure device ownership registration, verification, and anti-theft protection. Built on Polygon with Solidity smart contracts, integrating Decentralized Identifiers (DIDs), MetaMask wallets, and tamper-evident logs for immutable ownership records.

## 🌟 Key Features

### 🔐 Decentralized Authentication
- **MetaMask Wallet Integration**: Ethereum-compatible wallet authentication with signature verification for secure, passwordless login.
- **Google OAuth**: Seamless social login with JWT token generation.
- **DID Management**: Store and manage Decentralized Identifiers linked to wallet addresses for user identity.
- **Email/Password Fallback**: Traditional auth with bcrypt hashing and JWT sessions.

### 🛡️ Anti-Theft & Ownership Security
- **Immutable Registration**: Register devices (IMEI/ID) to DIDs on Polygon blockchain, preventing unauthorized re-registration.
- **Tamper-Evident Logs**: Solidity contracts emit events for registration, revocation, and transfers; queryable for dispute resolution.
- **Revocation System**: Owners can revoke devices; system prevents re-registration without owner consent.
- **Notification Alerts**: Real-time email and in-app messages for re-registration attempts, with support dispute escalation.

### 📱 Device Management
- **Registration**: Scan QR/barcode for IMEI input, sign transactions via MetaMask, generate cryptographic proofs.
- **Verification**: Cross-check device ID against DID with signature validation for ownership proof.
- **Checking**: Query blockchain for registration status without full verification.
- **PDF Certificates**: Download verifiable ownership certificates with embedded code for independent validation.
- **Device Stats**: View total registered devices, last registration date, and activity logs.

### 🤖 Smart Contract Features
- **Ownership Mapping**: Hash device IDs and DIDs for privacy-preserving storage.
- **Signature Verification**: Dual signatures (user + system) using ECDSA/secp256k1 and Keccak-256.
- **Event Logging**: Track DeviceRegistered, DeviceRevoked, and DeviceRevocationRemoved events.
- **Gas-Optimized**: Efficient read/write operations for Polygon network (low-cost transactions).

### 📊 User Experience
- **Responsive UI**: Mobile-friendly design with QR/barcode scanning via webcam.
- **Real-Time Feedback**: Toast notifications for transaction status, errors, and success.
- **Message Center**: In-app messaging for alerts, with read/delete functionality.
- **Profile Management**: Update name, email, phone, and DID post-authentication.

## 🏗️ Architecture

### Backend (Node.js + Express)
```
ownify-backend/
├── controllers/                 # API logic (auth, device management)
│   ├── auth.js                 # Signup, login, Google/MetaMask auth, password reset
│   └── device.js               # Registration, verification, notifications, PDF generation
├── models/                     # Mongoose schemas
│   └── User.js                 # User profiles, registered devices, messages
├── routes/                     # Express routes
│   ├── auth.js                 # /api/auth endpoints
│   └── device.js               # /api/device endpoints
├── middleware/                 # Auth guards, validation
├── utils/                      # Helpers (ethers signing, nodemailer, PDFKit)
├── server.js                   # Express app entry point
├── package.json                # Node.js dependencies
└── .env                        # Environment configuration
```

### Frontend (React + TypeScript)
```
ownify-frontend/
├── src/
│   ├── components/             # Reusable UI (FeatureCard, Header, Footer, dialogs)
│   ├── pages/                  # Routes (Dashboard, Profile, Activity)
│   ├── hooks/                  # Custom hooks (MetaMask connection, QR scanning)
│   ├── services/               # API clients (axios for backend, ethers for blockchain)
│   ├── utils/                  # Helpers (DID extraction, signature verification)
│   ├── App.tsx                 # Root component with routing
│   └── main.tsx                # Vite entry point
├── public/                     # Static assets (uploads for images)
├── package.json                # Node.js dependencies
└── vite.config.ts              # Vite build configuration
```

### Blockchain (Polygon + Solidity)
```
Smart Contract: Deployed at 0x885d93142535329562ef65bB77C2BBf11Dd32419 (Mumbai testnet; update for mainnet).
ABI: Included in frontend for contract interactions (registration, getRegistration, revokeDevice).
System Wallet: Pre-funded wallet for system signatures (SYSTEM_PUBLIC_KEY).
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- MetaMask browser extension (for testing blockchain interactions)
- Polygon Mumbai testnet account (MATIC faucet for gas)
- Gmail account for email notifications (or SMTP service)
- Webcam for QR/barcode scanning (optional, for device ID input)

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd ownify-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Required environment variables:**
   ```bash
   PORT=5000
   MONGODB_URI="mongodb://localhost:27017/ownify"  # Or Atlas URI
   JWT_SECRET="your_jwt_secret_key"                # Generate with openssl rand -hex 32
   GOOGLE_CLIENT_ID="your_google_oauth_client_id"
   EMAIL_USER="your_gmail@gmail.com"
   EMAIL_PASS="your_app_password"                  # Gmail app password
   SYSTEM_PRIVATE_KEY="your_system_wallet_private_key"  # For system signatures
   SYSTEM_PUBLIC_KEY="0xYourSystemWalletAddress"
   CONTRACT_ADDRESS="0x885d93142535329562ef65bB77C2BBf11Dd32419"  # Polygon contract
   ```

5. **Run the backend:**
   ```bash
   npm run dev  # Nodemon for development
   # or
   npm start    # Production'
   ```

   The API will be available at http://localhost:5000.
   
### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ownify-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. ***Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit with your backend URL and contract details
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

The application will be available at http://localhost:5173.

### Blockchain Setup

1. **Deploy Contract (if customizing):**
   ```bash
   Use Hardhat/Truffle with the provided ABI.
   Compile and deploy to Polygon Mumbai:npx hardhat run scripts/deploy.js --network mumbai
   ```

## 🔧 Technology Stack

### Backend
- **Framework:** Express.js (Node.js 18+)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, bcryptjs, Google OAuth2, Ethers (MetaMask signature verification)
- **Blockchain:** Ethers.js v6, Web3.js (Polygon integration)
- **Security:** Zod validation, crypto (hashing/signing), Nodemailer (emails)
- **Utilities:** PDFKit (certificates), Axios (internal HTTP)

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS + clsx/tailwind-merge
- **State Management:** React Query (TanStack), React Hook Form
- **Routing:** React Router DOM
- **Blockchain:** Ethers.js (MetaMask provider detection)
- **Scanning:** ZXing (QR/barcode), React Webcam
- **Charts/Other:** Recharts, Framer Motion, Sonner (toasts)

### Blockchain
- **Network:** Polygon (Mumbai testnet; mainnet ready)
- **Language:** Solidity (v0.8+)
- **Tools:** Ethers.js for contract ABI interactions
- **Standards:** ERC-721 inspired (ownership), EIP-712 (signatures), DID:ETHR method

## 🔒 Security Features

### Multi-Layer Authentication
1. **MetaMask Signature:** Verify messages with ethers.verifyMessage to prevent replay attacks.
2. **DID Normalization:** Lowercase addresses; extract from did:ethr:0x... format.
3. **JWT Sessions:** 1-hour expiration; bearer token auth for API protection.
4. **Password Reset:** Crypto-generated tokens (1-hour expiry) with email delivery.

### Ownership Protection
- **Hashing Privacy:** Keccak256 for device ID and DID to avoid plaintext exposure.
- **Dual Signatures:** User (MetaMask) + System (pre-funded wallet) for registration validity.
- **Revocation Checks:** Query isRevoked flag; notify original owner on re-attempts.
- **Notification System:** Email + in-app messages for disputes; store in user model.

### Verification Protocols
- **Signature Recovery:** ECDSA recovery with secp256k1 curve; match against public keys.
- **Blockchain Immutability:** Polygon events for audit trails; tamper-evident via consensus.
- **Input Validation:** Zod schemas for all requests; prevent injection/XSS.
- **Rate Limiting:** Express middleware (add via express-rate-limit for production).

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account (email/password)
- `POST /api/auth/login` - Email/password login (returns JWT)
- `POST /api/auth/google` - Google OAuth (access token → JWT)
- `POST /api/auth/metamask` - MetaMask signature verification (address/signature → JWT)
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset with token
- `GET /api/auth/me` - Get profile (requires JWT)
- `PUT /api/auth/profile` - Update profile (name/email/phone/DID)

### Device Management
- `POST /api/device/register` - Backend step for device registration (signatures/hashes)
- `GET /api/device` - List user's registered devices (query ?did=)
- `GET /api/device/stats/:userDid` - Device count and last registration date
- `GET /api/device/download/:deviceId` - Generate PDF certificate (query ?userDid=)
- `POST /api/device/check-and-notify` - Notify original owner on re-registration attempt
- `GET /api/device/by-address` - Fetch user by wallet address (query ?address=)
- `POST /api/device/messages` - Get user messages (body {userDid})
- `POST /api/device/mark-as-read` - Mark message read (body {messageId, userDid})
- `POST /api/device/delete-message` - Delete message (body {messageId, userDid})

### Blockchain (Frontend-Only Interactions)
- **registerDevice(hashedDeviceId, hashedDID, userSig, systemSig)** - On-chain registration
- **getRegistration(hashedDeviceId)** - Query ownership details
- **revokeDevice(hashedDeviceId)** - Revoke ownership
- **removeRevocation(hashedDeviceId)** - Restore revoked device

## 🧪 Development

### Running Tests
```bash
# Backend tests (add Jest/Mocha)
cd ownify-backend
npm test

# Frontend tests (Vite + Vitest)
cd ownify-frontend
npm run test
```

### Code Quality
```bash
# Backend linting/formatting
npm run lint  # ESLint
npm run format  # Prettier

# Frontend linting
npm run lint  # ESLint + TypeScript
npm run format  # Prettier
```

### 🔍 Smart Contract Deployment

Local Testing
```bash
Install Hardhat: npm i -D hardhat.
Compile: npx hardhat compile.
Test: npx hardhat test (add tests for registration/revocation).
Deploy to Mumbai: Update hardhat.config.js with Polygon RPC/Alchemy key.

Verification Code in PDFs
Certificates include Node.js snippet for independent validation:
const { ethers } = require("ethers");
async function verifyDocument() {
  const publicKey = "0x...";  // System public key
  const hashedDeviceId = "0x...";
  const hashedDID = "0x...";
  const signature = "0x...";
  const messageHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [hashedDeviceId, hashedDID]);
  const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
  console.log(recoveredAddress.toLowerCase() === publicKey.toLowerCase() ? "VALID" : "INVALID");
}
verifyDocument();
```

## 🔧 Configuration

### Security Settings
- **JWT Settings:** 1-hour expiry; HS256 algorithm.
- **Email Transport:** Nodemailer with Gmail; fallback to SMTP.
- **Blockchain RPC:** Configurable Polygon endpoint (Alchemy/Infura recommended).
- **Rate Limiting:** Add express-rate-limit for endpoints (e.g., 100 req/15min per IP).

### Notification Settings
- **Message Storage:** Array in User model; auto-expire after 30 days (cron job).
- **Email Templates:** HTML in forgotPassword and checkAndNotify.
- **Thresholds:** Min profile completeness (name/phone/DID) for registration.

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/decentralized-transfer`)
3. Commit changes (`git commit -m 'Add device transfer functionality'`)
4. Push to branch (`git push origin feature/decentralized-transfer`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- **Issues:** GitHub Issues tracker
- **Documentation:** `/docs` folder (add API docs with Swagger)
- **API Docs:** `http://localhost:5000/api-docs` (add Swagger middleware)
- **Discord/Slack:** [Link to community] (setup if needed)

## 🔮 Future Enhancements

- **Device Transfer Protocol:** On-chain ownership transfer with multi-sig approval.
- **Dispute Resolution:** Oracle integration (Chainlink) for IMEI validation.
- **Multi-Chain Support:** Ethereum L2s (Optimism/Base) alongside Polygon.
- **Advanced Analytics:** Dashboard with transaction history and fraud alerts.
- **Mobile Native Apps:** React Native with WalletConnect.
- **NFT Ownership:** Mint ERC-721 for high-value devices.
- **Zero-Knowledge Proofs:** Privacy-enhanced verification without revealing DIDs.


**Built with ❤️ for secure, decentralized device ownership**
