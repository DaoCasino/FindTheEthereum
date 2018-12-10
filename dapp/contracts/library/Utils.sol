pragma solidity ^0.4.24;

/**
 * @title Utils
 * @dev Library for operations with signatures
 */
library Utils {

    /**
    @notice Verify of RSA sign
    @param _hash raw message
    @param N N-component of RSA public keys
    @param E E-component of RSA public keys
    @param S Signature of the raw message
    */
    function verify(bytes32 _hash, bytes N, bytes E, bytes S) external view returns (bool) {
        bool retS;
        bytes memory valS;
        (retS, valS) = modexp(S, E, N);
        bytes32 valS32 = sliceLastBytes32(valS);
        return (retS == true && valS32 == _hash);
    }

    /**
    @notice Recover address from signature and hash
    @param _hash Hash for signature
    @param signature Signature hash
    @return The subscriber hash address
    */
    function recoverSigner(bytes32 _hash, bytes signature) public pure returns(address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        (r, s, v) = signatureSplit(signature);
        return ecrecover(_hash, v, r, s);
    }

    /**
    @notice check signer
    @param _sender msg.sender address
    @param _player player address
    @param _bankroller bankroller address
    @param _hash message hash
    @param _signature signature
    @return result
    */
    function checkSigner(address _sender, address _player, address _bankroller, bytes32 _hash, bytes _signature) external pure returns(bool) {
        address _signer = recoverSigner(_hash, _signature);
        require(_signer == _player || _signer == _bankroller, 'invalid signature');
        require(_sender != _signer, 'invalid msg.sender');
        require(_sender == _player || _sender == _bankroller, 'sender is not a member');
        return true;
    }

    /**
     * @dev Splits signature to R, S and V parts
     * @param signature interpretation of signature
     * @return Parts of signature
     */
    function signatureSplit(bytes signature) public pure returns(bytes32 r, bytes32 s, uint8 v) {
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 0xff)
        }
        require(v == 27 || v == 28);
    }

    function checkDoubleSignature(address[2] _users, bytes32 _hash, uint8[2] v, bytes32[2] r, bytes32[2] s) external pure returns(bool) {
        if (
            (ecrecover(_hash, v[0], r[0], s[0]) == _users[0] && ecrecover(_hash, v[1], r[1], s[1]) == _users[1]) ||
            (ecrecover(_hash, v[0], r[0], s[0]) == _users[1] && ecrecover(_hash, v[1], r[1], s[1]) == _users[0])
        ) {
            return true;
        }
        return false;
    }

    function checkSum(uint256[2] _a, uint256[2] _b) internal pure returns(bool) {
        if(_a[0] + _a[1] == _b[0] + _b[1]) {
            return true;
        }
        return false;
    }

    function memcopy(bytes src, uint srcoffset, bytes dst, uint dstoffset, uint len) pure internal {
        assembly {
        //begining of data in src and dst
            src := add(src, add(32, srcoffset))
            dst := add(dst, add(32, dstoffset))

        // copy 32 bytes at once
            for
            {} //counter not needed
            iszero(lt(len, 32)) //untill (len>32)
            {
                dst := add(dst, 32) //destination pointer shift to 32 bytes
                src := add(src, 32) //source pointer shift to 32 bytes
                len := sub(len, 32) //length of the remainder decrease to 32 bytes
            }
            { mstore(dst, mload(src)) }
        // copy the remainder (0 < len < 32)
            let mask := sub(exp(256, sub(32, len)), 1) //256^(32-len) - 1
            let srcpart := and(mload(src), not(mask)) //select first len bytes
            let dstpart := and(mload(dst), mask)  //set to zero first len bytes
            mstore(dst, or(srcpart, dstpart))   //first len bits of source copy to dst
        }
    }

    function modexp(bytes base, bytes exponent, bytes modulus) internal view returns (bool success, bytes output) {
        uint base_length = base.length;
        uint exponent_length = exponent.length;
        uint modulus_length = modulus.length;

        //Allocate memory for input
        uint size = (32 * 3) + base_length + exponent_length + modulus_length;
        bytes memory input = new bytes(size);

        ////Allocate memory for output
        output = new bytes(modulus_length);

        //Push lengths on the stack
        assembly {
        //mstore(addr, src) - push src to addr on the stack
            mstore(add(input, 32), base_length) //push base_length on the bytes[0]
            mstore(add(input, 64), exponent_length)
            mstore(add(input, 96), modulus_length)
        }
        //push base on the stack
        memcopy(base, 0, input, 96, base_length);
        //push exponent on the stack
        memcopy(exponent, 0, input, 96 + base_length, exponent_length);
        //push modulus on the stack
        memcopy(modulus, 0, input, 96 + base_length + exponent_length, modulus_length);

        //call bigModExp precompiled contract
        assembly {
            success := staticcall(gas(), 5, add(input, 32), size, add(output, 32), modulus_length)
        }
    }

        function sliceLastBytes32(bytes bytesArr) internal pure returns(bytes32 result) {
        uint length = bytesArr.length;
        assembly {
            result := mload(add(bytesArr, length))
        }
    }

}