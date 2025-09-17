// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVesting is ReentrancyGuard, Ownable {
    IERC20 public immutable token;

    struct Schedule {
        uint256 total;
        uint256 start; // unix timestamp
        uint256 cliff; // seconds from start
        uint256 duration; // seconds
        uint256 released;
    }

    mapping(address => Schedule[]) private _schedules;

    event Allocated(address indexed beneficiary, uint256 indexed scheduleId, uint256 amount);
    event Released(address indexed beneficiary, uint256 indexed scheduleId, uint256 amount);

    constructor(IERC20 _token) {
        token = _token;
    }

    function allocate(address beneficiary, uint256 amount, uint256 start, uint256 cliffDuration, uint256 duration) external onlyOwner {
        require(duration > 0, "duration 0");
        Schedule memory s = Schedule({
            total: amount,
            start: start,
            cliff: cliffDuration,
            duration: duration,
            released: 0
        });
        _schedules[beneficiary].push(s);
        emit Allocated(beneficiary, _schedules[beneficiary].length - 1, amount);
    }

    function schedulesLength(address beneficiary) external view returns (uint256) {
        return _schedules[beneficiary].length;
    }

    function releasableByIndex(address beneficiary, uint256 index) public view returns (uint256) {
        Schedule storage s = _schedules[beneficiary][index];
        uint256 vested = _vestedAmount(s);
        return vested > s.released ? vested - s.released : 0;
    }

    function release(uint256 index) external nonReentrant {
        require(index < _schedules[msg.sender].length, "invalid index");
        Schedule storage s = _schedules[msg.sender][index];
        uint256 vested = _vestedAmount(s);
        uint256 amount = vested > s.released ? vested - s.released : 0;
        require(amount > 0, "no releasable");
        s.released += amount;
        require(token.transfer(msg.sender, amount), "transfer failed");
        emit Released(msg.sender, index, amount);
    }

    function _vestedAmount(Schedule storage s) internal view returns (uint256) {
        uint256 _now = block.timestamp;
        if (_now < s.start + s.cliff) {
            return 0;
        } else if (_now >= s.start + s.duration) {
            return s.total;
        } else {
            uint256 elapsed = _now - s.start;
            return (s.total * elapsed) / s.duration;
        }
    }
}
