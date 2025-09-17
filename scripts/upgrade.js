const { ethers, upgrades } = require('hardhat');

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if(!proxyAddress) throw new Error('set PROXY_ADDRESS in env');
  const TokenV2 = await ethers.getContractFactory('TokenUpgradeable'); // replace with new Implementation name if changed
  const upgraded = await upgrades.upgradeProxy(proxyAddress, TokenV2);
  console.log('Upgraded:', upgraded.address);
}

main().catch((e)=>{console.error(e); process.exit(1);});
