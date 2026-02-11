# 🚀 ContribChain – Decentralized Group Contribution Tracker

> Fair grading. Transparent teamwork. Powered by Algorand Blockchain.

ContribChain is a decentralized platform that tracks **individual contributions in group projects** using immutable blockchain records.  
It eliminates freeloading, disputes, and biased grading by providing verifiable proof of work.

<img width="1920" height="1080" alt="Screenshot (1013)" src="https://github.com/user-attachments/assets/96104f2d-3312-4971-a516-491ac041fa65" />


---

## 🎯 Problem Statement

In academic and professional group projects:

- Some members contribute more than others  
- Grading is often subjective  
- Contribution proofs can be manipulated  
- Disputes arise at evaluation time  

**There is no trusted, tamper-proof system to track real effort.**

---

## 💡 Our Solution – ContribChain
<img width="507" height="544" alt="Screenshot (997)" src="https://github.com/user-attachments/assets/69932e44-a5a4-4ad9-b4ba-0e2a3cf0b2fd" />


ContribChain uses Algorand smart contracts to:

✔ Record every contribution on-chain  
✔ Timestamp proof of work  
✔ Provide transparent history  
✔ Enable fair score calculation  
✔ Prevent post-submission manipulation  

---

## 🧱 Architecture

### Tech Stack

- **Blockchain:** Algorand  
- **Frontend:** React + TypeScript + TailwindCSS  
- **Wallet:** Pera / Defly via use-wallet  
- **Smart Contracts:** Algokit utilities  
- **Network:** Testnet

### Flow
<img width="844" height="532" alt="Screenshot (999)" src="https://github.com/user-attachments/assets/bcef5130-9bbe-4a4b-93c5-d33662560744" />

1. User connects Algorand wallet  
2. Creates / joins project  
3. Members submit contributions  
4. Transactions stored immutably  
5. Dashboard shows contribution weight  
6. AI/logic detects suspicious patterns

---

## ✨ Features

### 🔐 Wallet Integration
- Secure Algorand wallet connection  
- Address display & session handling  

### 🧩 Core – ContribChain Module
- Create group project  
- Add team members  
- Log contributions  
- View immutable history  
- Fair share calculation  

### 🎨 Modern UI
- Glassmorphic design  
- Responsive dashboard  
- Animated feedback  
- Professional theme  

---

## 🖼 Screens

- Landing dashboard  
- Contribution panel  
- Wallet connection  
- Transaction success states  

<img width="1920" height="1080" alt="Screenshot (1011)" src="https://github.com/user-attachments/assets/e5187130-9bf6-4f88-835e-d25efe75644f" />


---

## 🚀 How to Run

### Prerequisites

- Node 18+  
- AlgoKit  
- Docker  
- Algorand Testnet account

### Setup

```bash
git clone <your-repo>
cd Hackathon-QuickStart-template

algokit project bootstrap all
algokit project run build

cd projects/frontend
npm install
npm run dev
```

### Environment

Create `.env` in `projects/frontend`

```env
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_NETWORK=testnet
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

---

## 🧠 Why This Matters

- Fair evaluation in colleges  
- DAO-style teamwork  
- Internship project tracking  
- Open-source contribution proof  
- Freelance transparency  

---

## 📌 Future Scope

- AI fraud detection  
- GitHub commit linking  
- Professor dashboard  
- NFT certificates  
- Multi-chain support  

---

## 👩‍💻 Team – NyanArchy 

**Arya Shinde** 
**Rutuja Solanke** 


---

## 🔗 References

- Algorand Dev: https://dev.algorand.co  
- AlgoKit: https://algorand.co/algokit  
- use-wallet: txnlab
