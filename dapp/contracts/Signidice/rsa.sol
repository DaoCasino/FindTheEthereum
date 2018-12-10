pragma solidity ^0.4.17;

/**
@title contract for verify RSA sign
@dev contract contains the necessary changes for sign hash
@author Nick Johnson
*/
contract RSA {

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

    function sliceLastBytes32(bytes bytesArr) public pure returns(bytes32 result) {
        uint length = bytesArr.length;
        assembly {
            result := mload(add(bytesArr, length))
        }
    }

}