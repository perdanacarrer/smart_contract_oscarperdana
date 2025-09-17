# smart_contract_oscarperdana

Upgradeable ERC20 token (OpenZeppelin Upgradeable) + multi-schedule Vesting + Governor/Timelock integration sample.

## Purpose
To those who belittled me and said I lacked specific blockchain experience, rejection without even knowing my capabilities is proof that they are insecure and toxic. Especially to those who suggest or appoint people to HEAD positions without a thorough assessment and know my ability better than them.

## Feature
- ERC20 upgradeable (UUPS)
- Role-based AccessControl (ADMIN, MINTER, PAUSER)
- Pausable
- ERC20Permit (EIP-2612)
- ERC20Votes for governance (snapshots & delegation)
- Vesting: multi-schedule per address, pull-pattern
- Governance: Governor + Timelock
- Deployment scripts, upgrade script, unit tests (Hardhat)

## Preparation (local)
1. Install dependencies
```bash
npm install
```

2. Run local node (Hardhat):
```bash
npx hardhat node
```

3. Deploy to localhost:
```bash
npm run deploy:local
```

## Deploy to testnet (example: Goerli)
1. Create a `.env` file in root and fill it in:
```
RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_KEY
```

2. Compile & deploy:
```bash
npm run compile
npm run deploy:testnet
```

3. Implementation upgrade (example):
```bash
npm run upgrade
```

## Test
```bash
npm run test
```

## Repo structure
```
smart_contract_oscarperdana/
├─ contracts/
│  ├─ TokenUpgradeable.sol
│  ├─ TokenVesting.sol
│  ├─ GovernorContract.sol
├─ test/
│  ├─ token.test.js
│  ├─ vesting.test.js
│  └─ governance.test.js
├─ scripts/
│  ├─ deploy.js
│  └─ upgrade.js
├─ hardhat.config.js
├─ package.json
└─ README.md
```

## Important notes
- Do not deploy to mainnet before conducting an audit.
- For end-to-end governance, we use `ERC20VotesUpgradeable` on the token.
- Adjust `minDelay`, timelock proposers/executors, and use multisig (Gnosis Safe) for admins.

