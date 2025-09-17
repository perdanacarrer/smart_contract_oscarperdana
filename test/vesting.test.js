const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TokenVesting', function(){
  let ERC20Mock, erc, Vesting, vesting, owner, ben;

  beforeEach(async function(){
    [owner, ben] = await ethers.getSigners();
    ERC20Mock = await ethers.getContractFactory('ERC20PresetMinterPauser');
    erc = await ERC20Mock.deploy('Mock','MCK');
    await erc.deployed();
    await erc.mint(owner.address, ethers.utils.parseUnits('1000',18));

    Vesting = await ethers.getContractFactory('TokenVesting');
    vesting = await Vesting.deploy(erc.address);
    await vesting.deployed();

    await erc.transfer(vesting.address, ethers.utils.parseUnits('100',18));
    const now = Math.floor(Date.now() / 1000);
    await vesting.allocate(ben.address, ethers.utils.parseUnits('50',18), now, 0, 60);
  });

  it('releasable increases over time', async function(){
    await ethers.provider.send('evm_increaseTime', [30]);
    await ethers.provider.send('evm_mine');
    const releasable = await vesting.releasableByIndex(ben.address, 0);
    expect(releasable).to.be.gt(0);
  });
});
