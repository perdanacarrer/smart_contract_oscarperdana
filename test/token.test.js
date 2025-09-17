const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('TokenUpgradeable', function(){
  let Token, token, owner, addr1;
  beforeEach(async function(){
    [owner, addr1] = await ethers.getSigners();
    Token = await ethers.getContractFactory('TokenUpgradeable');
    token = await upgrades.deployProxy(Token, ['MyToken', 'MTK', ethers.utils.parseUnits('1000',18), owner.address], { initializer: 'initialize' });
    await token.deployed();
  });

  it('initial supply to owner', async function(){
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits('1000',18));
  });

  it('mint by minter role', async function(){
    await token.grantRole(await token.MINTER_ROLE(), owner.address);
    await token.mint(addr1.address, ethers.utils.parseUnits('10',18));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits('10',18));
  });

  it('pauses transfers', async function(){
    await token.grantRole(await token.PAUSER_ROLE(), owner.address);
    await token.pause();
    await expect(token.transfer(addr1.address, 1)).to.be.revertedWith('TokenUpgradeable: paused');
    await token.unpause();
    await token.transfer(addr1.address, ethers.utils.parseUnits('1',18));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits('1',18));
  });
});
