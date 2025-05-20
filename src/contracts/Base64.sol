// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function decode(bytes memory data) public pure returns (bytes memory) {        uint256 len = data.length;
        if (len % 4 != 0) revert("Invalid base64 length");
        
        bytes memory result = new bytes(len / 4 * 3);
        uint256 resultPtr;
        
        for (uint256 i = 0; i < len; ) {
            uint256 value = (uint256(uint8(data[i])) << 18) |
                           (uint256(uint8(data[i+1])) << 12) |
                           (uint256(uint8(data[i+2])) << 6) |
                           uint256(uint8(data[i+3]));

            result[resultPtr++] = bytes1(uint8(value >> 16));
            result[resultPtr++] = bytes1(uint8(value >> 8));
            result[resultPtr++] = bytes1(uint8(value));
            i += 4;
        }

        // Handle padding
        if (len > 0 && data[len-1] == '=') {
            assembly { mstore(result, sub(mload(result), 1)) }
            if (len > 1 && data[len-2] == '=') {
                assembly { mstore(result, sub(mload(result), 1)) }
            }
        }
        return result;
    }
}
