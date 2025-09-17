const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer, guardian] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy Token (upgradeable) with ERC20Votes
  const Token = await ethers.getContractFactory("TokenUpgradeable");
  const token = await upgrades.deployProxy(Token, ["MyToken", "MTK", ethers.utils.parseUnits("1000000", 18), deployer.address], { initializer: 'initialize' });
  await token.deployed();
  console.log("Token proxy:", token.address);

  // Deploy TimelockController
  const minDelay = 2 * 24 * 60 * 60; // 2 days
  const proposers = [deployer.address];
  const executors = [ethers.constants.AddressZero];
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(minDelay, proposers, executors, guardian.address);
  await timelock.deployed();
  console.log("Timelock:", timelock.address);

  // Deploy Governor
  const Governor = await ethers.getContractFactory("GovernorContract");
  const governor = await Governor.deploy(token.address, timelock.address);
  await governor.deployed();
  console.log("Governor:", governor.address);

  // Grant timelock the admin role on the token
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  await token.grantRole(DEFAULT_ADMIN_ROLE, timelock.address);
  console.log("Granted token admin role to timelock");

  // Deploy Vesting
  const Vesting = await ethers.getContractFactory("TokenVesting");
  const vesting = await Vesting.deploy(token.address);
  await vesting.deployed();
  console.log("Vesting:", vesting.address);

  // Fund vesting contract example
  // Mint to deployer then transfer to vesting
  await token.grantRole(await token.MINTER_ROLE(), deployer.address);
  await token.mint(deployer.address, ethers.utils.parseUnits("10000", 18));
  await token.transfer(vesting.address, ethers.utils.parseUnits("10000", 18));
  console.log("Funded vesting contract with 10000 tokens");

  console.log('Deployment complete');
}

main().catch((e)=>{console.error(e); process.exit(1);});
