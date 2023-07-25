// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./RawMaterial.sol";

contract Chmod {
    // Mapping to store write permissions for each resource (UPC code)
    mapping(string => address[]) private resourcePermissions;
    RawMaterial  private      upcNFT;
    address payable private owner;



    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () {
        owner     =   payable(msg.sender);
        upcNFT    =   RawMaterial(0x77e45380585826D0947a032453a2d7B0d18d6078);
    }


    modifier onlyOwner
    {
        require(
            msg.sender == owner,
            "Sender not authorized."
        );
        // Do not forget the "_;"! It will
        // be replaced by the actual function
        // body when the modifier is used.
        _;
    }    


    function setNft(address newAddress) public  onlyOwner{
        upcNFT = RawMaterial(newAddress);
    }

    // Function to grant write permission for a specific resource (UPC code)
    function grantPermission(string memory upcCode, address user) public {
        address upcOwner = upcNFT.getUpcOwner(upcCode);
        require(
            msg.sender == upcOwner,
            "Sender not authorized."
        );

        require(user != address(0), "Invalid address");
        resourcePermissions[upcCode].push(user);
    }

    // Function to revoke write permission for a specific resource (UPC code)
    function revokePermission(string memory upcCode, address user) public {
        address[] storage permissions = resourcePermissions[upcCode];
        for (uint256 i = 0; i < permissions.length; i++) {
            if (permissions[i] == user) {
                permissions[i] = permissions[permissions.length - 1];
                permissions.pop();
                break;
            }
        }
    }

    // Function to check if an address has write permission for a specific resource (UPC code)
    function checkPermission(string memory upcCode, address user) public view returns (bool) {
        address upcOwner = upcNFT.getUpcOwner(upcCode);
        if(user == upcOwner) {
            return true;
        }
        address[] storage permissions = resourcePermissions[upcCode];
        for (uint256 i = 0; i < permissions.length; i++) {
            if (permissions[i] == user) {
                return true;
            }
        }
        return false;
    }
}
